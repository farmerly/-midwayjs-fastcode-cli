import BaseGenerator from '../generator';
import print from '../../lib/utils/print';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';

/**
 * dto 生成器
 */
export default class DtoGenerator extends BaseGenerator {
  async generate(
    table: { tableName: string; tableComment: string },
    info: { columns: any[]; foreignKeys: any[]; references: any[] },
    modulePath: string,
  ): Promise<void> {
    print(`${table.tableName} 生成 dto 文件`);

    /** 拼装模板所需要的数据 */
    const data = {};
    _.set(data, 'className', this.pascalConvert(table.tableName));

    const templatePath = path.join(__dirname, 'template.ts.ejs');
    const template = fs.readFileSync(templatePath, 'utf8');
    const content = ejs.compile(template)(data);

    /** 写入文件 */
    const fileName = `${this.hyphenConvert(table.tableName)}.ts`;
    this.writeModuleFile(modulePath, fileName, content);
  }
}
