import BaseGenerator from '../generator';
import print from '../../lib/utils/print';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
 * controller 生成器
 */
export default class ControllerGenerator extends BaseGenerator {
  async generate(
    table: { tableName: string; tableComment: string },
    info: { columns: any[]; foreignKeys: any[]; references: any[] },
    modulePath: string,
  ): Promise<void> {
    print(`${table.tableName} 生成 controller 文件`);

    /** 拼装模板所需要的数据 */
    const data = {};
    _.set(data, 'className', this.pascalConvert(table.tableName));
    _.set(data, 'routePath', this.hyphenConvert(table.tableName));
    _.set(data, 'apiTags', table.tableComment);

    const templatePath = path.join(__dirname, 'template.ts.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const content = ejs.compile(template)(data);

    /** 写入文件 */
    const fileName = `${this.hyphenConvert(table.tableName)}.ts`;
    this.writeModuleFile(modulePath, fileName, content);
  }
}
