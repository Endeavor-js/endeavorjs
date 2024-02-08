import { configHandler } from '../config/configHandler';

export default class logHandler {
	config: configHandler;

  constructor(config: configHandler) {
		this.config = config;
  }

	init(){
		console.log("logger init")
	}

  info() {
    return;
  } 

  warning() {
    return;
  }

  success() {
    return;
  }

  debug() {
    return;
  }

  error() {
    return;
  }

  fatal() {
    return;
  }

  trace() {
    return;
  }

  notice() {
    return;
  }

	custom(){
		return
	}

}


