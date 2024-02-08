import { configHandler } from './config/configHandler';
import logHandler from './logger/logHandler'
export class server {
  configPath: string;

  config: configHandler;
	log: logHandler; 
  constructor(configPath: string) {
    this.configPath = configPath;
    this.config = new configHandler(configPath);
		this.log = new logHandler(this.config);
  }

  init() {

// Example usage with arrays and undefined values
const newConfig = {
  name: 'John Doe',
  admin: true,
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  object: {
    name: null,
    age: 15,
    objectb: {
      name: 'a',
    },
  },
  // Adding a new array field with undefined values for demonstration
  testarray: [1, undefined, 'test'],
  extraField: 'This is an extra field.',
  testobject: {
    asd: 'value1',
    pao: 'value2',
    test: undefined,
    a: null,
    b: {
      t: ['a', null],
    },
  },
};

    const config = new configHandler('./configs')
		config.generateConfig<typeof newConfig>('system1', 'config.json', newConfig);
		const a = config.loadConfig<typeof newConfig>('system1', 'config.json');
		if (!a) throw 'error';
		console.log(a, a.admin);

  }
}
