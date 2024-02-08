import * as fs from 'fs';

export class configHandler {
  path: string;
  public systems: Array<string> = [];
  constructor(path: string) {
    this.path = path;
  }

  init() {
    if (!fs.existsSync(this.path)) {
      console.warn('creating config base folder');
      fs.mkdirSync(this.path);
    }
  }

  generateConfig<config>(
    systemName: string,
    configName: string,
    configObject: config,
  ): void {
    const parentFolder = this.path;
    const subFolder = `${parentFolder}${systemName}/`;
    const filePath = `${subFolder}${configName}`;
		
    // Check if subfolder exists, create if not
    if (!fs.existsSync(subFolder)) {
      fs.mkdirSync(subFolder, { recursive: true });
    }

    let existingConfig: {} | config = {};

    // Check if config file exists
    if (fs.existsSync(filePath)) {
      // Check if the file is empty
      if (this.isFileEmpty(filePath)) {
        console.log(
          `The existing file ${configName} is empty. Repopulating it.`
        );
      } else {
        // Read existing config file
        existingConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Check for unnecessary fields in existingConfig
        const unnecessaryFields = this.updateMissingFields(
          existingConfig,
          configObject
        );

        // Replace null fields with 'placeholder'
        existingConfig = this.replaceNullFields(existingConfig);

        // Write the updated config file
        fs.writeFileSync(filePath, JSON.stringify(existingConfig, null, 2));

        if (unnecessaryFields.length > 0) {
          console.log(
            `Unnecessary fields found:\n${unnecessaryFields.join('\n')}`
          );
        }

        console.log(
          `Updated ${configName} with missing fields and replaced null values.`
        );
        return;
      }
    }

    // Replace null fields with 'placeholder' in the new config
    const updatedConfig = this.replaceNullFields(configObject);

    // Write the config file
    fs.writeFileSync(filePath, JSON.stringify(updatedConfig, null, 2));

    console.log(`Created ${configName}.`);
  }

  private isFileEmpty(filePath: string): boolean {
    try {
      const stats = fs.statSync(filePath);
      return stats.size === 0;
    } catch (error) {
      return false;
    }
  }

  loadConfig<data>(
    systemName: string,
    configName: string
  ): data | void {
    function checkPlaceholders(obj: any, path: string[] = []): void {
      if (obj !== null && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          for (let i = 0; i < obj.length; i++) {
            checkPlaceholders(obj[i], [...path, i.toString()]);

            // Check if the value is 'placeholder'
            if (obj[i] === 'placeholder') {
              const fullPath =
                path.length > 0 ? path.join('.') + '.' + i : i.toString();
              console.log(
                `Found 'placeholder' at '${fullPath}' in the configuration.`
              );
            }
          }
        } else {
          for (const key in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(key)) {
              checkPlaceholders(obj[key], [...path, key]);

              // Check if the value is 'placeholder'
              if (obj[key] === 'placeholder') {
                const fullPath =
                  path.length > 0 ? path.join('.') + '.' + key : key;
                console.log(
                  `Found 'placeholder' at '${fullPath}' in the configuration.`
                );
              }
            }
          }
        }
      }
    }

    const filePath = `${this.path}/${systemName}/${configName}`;

    try {
      // Read the config file
      const configFileContent = fs.readFileSync(filePath, 'utf-8');
      const configObject = JSON.parse(configFileContent);

      checkPlaceholders(configObject);
      return configObject;
    } catch (error) {
      console.error(
        // @ts-ignore
        `Error reading or parsing the config file: ${error.message}`
      );
    }
  }

  private replaceNullFields<data>(config: data): data {
    const result: data = { ...config };

    function replaceNull(obj: any): any {
      if (obj !== null && typeof obj === 'object') {
        if (Array.isArray(obj)) {
          return obj.map((item: any) => replaceNull(item));
        } else {
          for (const key in obj) {
            // eslint-disable-next-line no-prototype-builtins
            if (obj.hasOwnProperty(key)) {
              obj[key] = replaceNull(obj[key]);

              // Convert undefined to null
              if (obj[key] === undefined) {
                obj[key] = null;
              }

              // Replace null with 'placeholder'
              if (obj[key] === null) {
                obj[key] = 'placeholder';
              }
            }
          }
        }
      } else if (obj === null) {
        obj = 'placeholder';
      }
      return obj;
    }

    for (const key in result) {
      // @ts-ignore
      // eslint-disable-next-line no-prototype-builtins
      if (result.hasOwnProperty(key)) {
        // @ts-ignore
        result[key] = replaceNull(result[key]);

        // @ts-ignore
        if (result[key] === undefined) {
          // @ts-ignore
          result[key] = null;
        }

        // @ts-ignore
        if (result[key] === null) {
          // @ts-ignore
          result[key] = 'placeholder';
        }
      }
    }

    return result;
  }

  private updateMissingFields(
    target: any,
    source: any,
    path: string[] = []
  ): string[] {
    const unnecessaryFields: string[] = [];

    for (const key in target) {
      // eslint-disable-next-line no-prototype-builtins
      if (target.hasOwnProperty(key) && !(key in source)) {
        // Track unnecessary field
        const fullPath = path.length > 0 ? path.join('.') + '.' + key : key;
        unnecessaryFields.push(fullPath);
      }
    }

    for (const key in source) {
      // eslint-disable-next-line no-prototype-builtins
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          // Recursively update nested objects or arrays
          if (Array.isArray(source[key])) {
            target[key] = target[key] || [];
            unnecessaryFields.push(
              ...this.updateMissingFields(target[key], source[key], [...path, key])
            );
          } else {
            target[key] = target[key] || {};
            unnecessaryFields.push(
              ...this.updateMissingFields(target[key], source[key], [...path, key])
            );
          }
        } else if (!(key in target)) {
          // Add missing field
          target[key] = source[key];
          const fullPath = path.length > 0 ? path.join('.') + '.' + key : key;
          console.log(
            `Added missing field '${fullPath}' to the configuration.`
          );
        }
      }
    }

    return unnecessaryFields;
  }
}

