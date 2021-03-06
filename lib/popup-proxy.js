const _ = require('underscore');
const { EventEmitter } = require("events");

class PopupProxy extends EventEmitter {
    constructor(module, config) {
    	super();
    	this.module = module;
    	this.config = config;
    	this.uid = config.uid;
    	this.init();
    }
    init(){
    	this.onRPC("closed", (args)=>{
    		this.emit("closed", args);
    	});
    	this.onRPC("init", (args, callback)=>{
    		if(this.state){
    			this[this.state.op](this.state.args, this.state.callback);
            }
            this.setArgs(this.args || this.config.args, callback);
    	})
    }
    setArgs(args, callback){
        this.args = args;
        this.dispatch("args", args || {}, callback);
    }
    show(args, callback){
    	this.state = {op:"show", args, callback};
    	this.dispatch("show", args || {}, callback);
    }
    hide(args, callback){
    	this.state = {op:"hide", args, callback};
    	this.dispatch("hide", args || {}, callback);
    }
    close(args, callback){
    	this.state = {op:"close", args, callback};
    	this.dispatch("close", args || {}, callback);
    }
    dispatch(eventName, args, callback){
    	this.module.fireRPCEvent(`POPUP.${this.uid}.`+eventName, args, callback);
    }
    onRPC(eventName, callback){
        this.module.onRPCEvent(`POPUP.${this.uid}.`+eventName, (args, next)=>{
            callback(args, (err, result)=>{
                if(!_.isFunction(next))
                    return
                if(err)
                    return next(err);

                next(result);
            })
        });
    }
}


module.exports = PopupProxy;