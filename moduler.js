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

    var appInstance =  new App;

    var store = function(){
        var wrapper = {};
        var modules = {};
        var getDeps = function(deps, callerName){
            return deps.map(function(dep){
                if( modules[dep].deps.indexOf(callerName) !== -1 ){
                    throw new Error("You have a circular dependency between '" + dep + "' and '" + callerName + "' module.");
                }
                return modules[dep].init();
            });
        };
        return {
          getAll : wrapper,
          getOrSet : function(nameOrObjectModule, depsOrModule, maybeModule){
            var objectModule = typeof nameOrObjectModule === 'object';
            var name = objectModule ? Object.keys(nameOrObjectModule)[0] : nameOrObjectModule;
            var instance = this;
            var module = maybeModule || depsOrModule || objectModule && nameOrObjectModule[name],
                deps = maybeModule ? depsOrModule : [];
            var resolve = once(function(){
              var newInstance = Object.create(instance);
              return module.bind(newInstance, newInstance).apply(newInstance, getDeps(deps, name));
            });
            if( module ){
              Object.defineProperty(wrapper, name, {get : resolve});
            }
            return module ? modules[name] = {
                deps : deps,
                init : resolve
            } : modules[name];
        }
      };
    };

    var __store = store();
    var __module = __store.getOrSet;
    var __modules = __store.getAll;

    var __run = function(deps, app){
        return __module.call(appInstance, 'app', deps, app).init();
    };
    var __config = function(name, dep){
        Object.defineProperty(this, name, { value : dep, writable : false });
        return this;
    }
    Object.defineProperties(App.prototype, {
        run : { value : __run, writable : false },
        module : { value : __module, writable : false },
        modules : { value : __modules, writable : false },
        config : { value : __config, writable : false },
        store : { value : store, writable : false },
    });
    return appInstance;
}());

module.exports = app;
