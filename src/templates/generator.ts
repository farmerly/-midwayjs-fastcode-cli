import fs from 'fs';
import _ from 'lodash';
import path from 'path';

/**
 * 代码生成器基类
 */
export default abstract class Generator {
  /**
   * 代码生成抽象接口
   * @param table 表信息
   * @param info 字段、外键信息
   * @param modulePath 代码模块路径
   */
  abstract generate(
    table: { tableName: string; tableComment: string },
    info: { columns: any[]; foreignKeys: any[]; references: any[] },
    modulePath: string,
  ): Promise<void>;

  /**
   * 转换为驼峰命名
   * @param name 字段名
   * @returns
   */
  protected camelConvert(name: string) {
    return _.camelCase(name);
  }

  /**
   * 转换为帕斯卡命名
   * @param name 字段名
   * @returns
   */
  protected pascalConvert(name: string) {
    return _.upperFirst(_.camelCase(name));
  }

  /**
   * 下划线转中横线
   * @param name
   */
  protected hyphenConvert(name: string) {
    return new String(name).replace(/_/g, '-');
  }

  /**
   * 名称转大写
   * @param name
   * @returns
   */
  protected upperConvert(name: string) {
    return _.toUpper(name);
  }

  /**
   * 写入 module 文件
   * @param filepath
   * @param filename
   * @param content
   */
  protected writeModuleFile(
    filepath: string,
    filename: string,
    content: string,
  ) {
    const perfectPath = path.join(process.cwd(), filepath);
    if (!this.fileAccess(perfectPath)) this.mkdir(perfectPath);
    this.writeFile(path.join(perfectPath, filename), content);
  }

  /**
   * 检查文件是否存在
   * @param filepath
   * @returns
   */
  private fileAccess(filepath: string) {
    try {
      fs.accessSync(filepath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false;
      }
      throw error;
    }
    return true;
  }

  /**
   * 创建文件夹
   * @param filepath
   */
  private mkdir(filepath: string) {
    try {
      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * 写入文件
   * @param filename 文件路径
   * @param content 文件内容
   */
  private writeFile(filename: string, content: string) {
    fs.writeFileSync(filename, content, { encoding: 'utf8' });
  }
}
