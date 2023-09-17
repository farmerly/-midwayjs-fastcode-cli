import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import Bb from 'bluebird';
import inquirer from 'inquirer';
import baseOptions from '../lib/utils/yargs';
import print from '../lib/utils/print';
import database from '../lib/utils/database';
import stringComplement from '../lib/utils/complement';
import templates from '../lib/constant/module-templates';
import GeneratorFactory from '../templates/generator-factory';

/**
 * 读取 sequelizerc 文件内容
 * @returns
 */
const loadRcFile = () => {
  const rcFile = path.resolve(process.cwd(), '.sequelizerc');
  return fs.existsSync(rcFile)
    ? JSON.parse(JSON.stringify(require(rcFile)))
    : undefined;
};

/**
 * 确认配置项
 * @returns
 */
const confirmOptions = async () => {
  const message = '确认以上配置并开始生成:';
  return await inquirer
    .prompt({
      name: 'data',
      type: 'confirm',
      message: message,
    })
    .then((ret) => ret.data);
};

/**
 * 选择生成的表
 * @param tables
 * @returns
 */
const choiceTables = async (
  tables: { tableName: string; tableComment: string }[],
) => {
  const message = `选择需要生成的表名称:`;
  const choices = await Bb.map(tables, (p) => {
    const name = stringComplement(p.tableName, 'suffix');
    const comment = stringComplement(p.tableComment, 'prefix');
    return { name: `${name} <----> ${comment}`, value: p };
  });

  return inquirer
    .prompt([
      {
        name: 'data',
        type: 'checkbox',
        message: message,
        choices: choices,
      },
    ])
    .then((ret) => ret.data);
};

/**
 * 选择模板
 * @param templates
 * @returns
 */
const choiceTemplates = async (
  templates: { name: string; comment: string }[],
) => {
  const message = `选择需要生成的代码:`;
  const choices = await Bb.map(templates, (p) => {
    const name = stringComplement(p.name, 'suffix');
    const comment = stringComplement(p.comment, 'prefix');
    return { name: `${name} <----> ${comment}`, value: p };
  });

  return inquirer
    .prompt([
      {
        name: 'data',
        type: 'checkbox',
        message: message,
        choices: choices,
      },
    ])
    .then((ret) => ret.data);
};

export default async (yargs) => {
  const args = baseOptions(yargs).argv;
  print(`当前运行环境[${args['env']}]`);
  const rcInfo = loadRcFile();
  if (!rcInfo) {
    print('未找到 .sequelizerc 配置文件', 'error');
    return;
  }
  const db = new database(rcInfo, args['env']);
  await db.connect();
  const tables = await db.getTables();
  let finalTables: any[], finalTemplates: any[];
  do {
    finalTables = await choiceTables(tables);
    finalTemplates = await choiceTemplates(templates);
    if (await confirmOptions()) break;
  } while (true);

  await Bb.each(finalTables, async (table) => {
    const info = await db.getTableDetails(table.tableName);
    const factory = new GeneratorFactory();
    await Bb.each(finalTemplates, async (p: any) => {
      const generator = factory.createGenerator(p.name);
      await generator.generate(table, info, p.path);
    });
  });
  await db.disconnect();
};
