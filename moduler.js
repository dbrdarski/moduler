var app = (function(){

    var once = function(fn){
        var resolve;
        return function(){
            if (resolve == null){
                resolve = fn.apply(null, arguments);
            }
            return resolve;
        }
    }

    function App(){}
    var __module = (function(){
        var modules = {};
        var getDeps = function(deps, callerName){
            return deps.map(function(dep){
                if( modules[dep].deps.indexOf(callerName) !== -1 ){
                    throw new Error("You have a circular dependency between '" + dep + "' and '" + callerName + "' module.");
                }
                return modules[dep].init();
            });
        };
        return function(name, depsOrModule, maybeModule){
            var module = maybeModule || depsOrModule,
                deps = maybeModule ? depsOrModule : [];
            return module ? modules[name] = {
                deps : deps,
                init : once(function(){ return module.apply(null, getDeps(deps, name)); })
            } : modules[name];
        };
    }());
    var __run = function(deps, app){
        return __module('app', deps, app).init()
    };
    var __config = function(name, dep){
        Object.defineProperty(App.prototype, name, { value : dep, writable : false });
        return this;
    }
    Object.defineProperties(App.prototype, {
        run : { value : __run, writable : false },
        module : { value : __module, writable : false },            
        config : { value : __config, writable : false },            
    });
    return new App;
}());

module.exports = app;