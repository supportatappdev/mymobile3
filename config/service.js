
var mymobile3 = angular.module('mymobile3');
mymobile3.service('Util', function($filter) {
    this.trim = function(value) {
     return function(value) {
        if(!angular.isString(value)) {
            return value;
        }  
        return value.replace(/^\s+|\s+$/g, ''); // you could use .trim, but it's not going to work in IE<9
     };
    }
    this.convertDate = function(_date) {
        return $filter('date')(_date, "dd-MM-yyyy");
    }
    this.convertMMDate = function(_date) {
        return $filter('date')(_date, "MM/dd/yyyy");
    }
    this.convertDBDate = function(_date) {
        if (console) {
            console.log(_date + ":" + $filter('date')(_date, "yyyy-MM-dd HH:mm:ss"));
        }
        return $filter('date')(_date, "yyyy-MM-dd HH:mm:ss");
    }
    this.isEmpty = function(src) {
       if(src == undefined || src.trim().length == 0) {
           return true;
       }
       return false;
    }
});
mymobile3.service('BSServiceUtil', function(notify, ExportService, BSService, Cache) {
    this.getLookups = function(lookupType,callback,isCache) {
        var _key = 'lookup_res_' + lookupType;
        if (isCache && Cache.get(_key)) {
            return Cache.get(_key);
        } else {
            if(!isCache) {
              _key = '_NOCACHE_';
            
            }
            //queryResultWithCallback = function(dsName,keyName,wC,wCparams,oB,callback)
            return this.queryResultWithCallback("c3pLookupsRef", _key, 'LOOKUP_TYPE = ?', [lookupType], null, callback);
        }
    }
    this.removeData = function(key) {
        Cache.remove(key);
    }
    this.queryResultWithCallback = function(dsName, keyName, wC, wCparams, oB, callback, limit, offset, isCount, isExport, selectClause) {
        var inputJSON = {
            "ds": dsName,
            "executeCountSql": "N"
        };
        if (wC) {
            inputJSON.wC = wC;
        }
        if (wCparams) {
            inputJSON.params = wCparams;
        }
        if (oB) {
            inputJSON.oB = oB;
        }
        if (limit) {
            inputJSON.limit = limit;
        }
        if (offset) {
            inputJSON.offset = offset;
        }
        if (isCount) {
            inputJSON.is_count = "Y";
        }
        if (selectClause) {
            inputJSON.select = selectClause;
        }
        var _ser = BSService;
        if (isExport && isExport == "Y") {
            _ser = ExportService;
        }
        _ser.query({
            "method": "data"
        }, inputJSON, function(result) {
            if (result.status === "E") {
                notify({
                    message: result.title + ' - ' + result.errorMsg,
                    classes: 'alert-danger'
                });
            } else {
                if (!(isExport == "Y") && result.data.length > 0) {
                    if (keyName && keyName !== '_NOCACHE_') {
                        Cache.put(keyName, result.data);
                    }
                } //else {
                if (callback) {
                    if (isExport == "Y" || isCount) {
                        callback(result);
                    } else {
                        callback(result.data);
                    }
                }
                //callback();
                //}
            }
        });
    }
    this.queryResult = function(dsName, keyName) {
        var inputJSON = {
            "ds": dsName,
            "executeCountSql": "N"
        };
        if (dsName === "usersRef") {
            inputJSON.skipCondtions = "Y";
        }
        inputJSON.oB = "CREATION_DATE ASC";
        BSService.query({
            "method": "data"
        }, inputJSON, function(result) {
            console.log(result);
            if (result.status === "E") {
                notify({
                    message: result.title + ' - ' + result.errorMsg,
                    classes: 'alert-danger'
                });
            } else {
                if (result.data.length > 0) {
                    Cache.put(keyName, result.data);
                    return Cache.get(keyName);
                }
            }
        });
    }
});
mymobile3.service('EmailService', function(notify, BSService) {
    this.sendEmail = function(body, sourceId, attachmentIds) {
        var operation = "INSERT";
        var datajson = {
            'ds': 'c3pEmailService',
            'operation': operation,
            'data': {
                'srcId': sourceId,
                'body': body,
                'attachmentIds': attachmentIds
            }
        };
        BSService.save({
            'method': 'update'
        }, datajson, function(result) {
            if (result.status === "E") {
                notify({
                    message: result.title + ' - ' + result.errorMsg,
                    classes: 'alert-danger'
                });
            }
        });
    };
    
    
});
mymobile3.service('CommentService', function(notify, BSService) {
    var addOnlyComments = function(inputJson, callback) {
        var operation;
        var datajson;
        operation = "INSERT";
        var dataItem = {
            'ACTIVITY_ID': inputJson.actId,
            'COMMENT': inputJson.comment,
            'APP_ID': inputJson._appId,
            'ORG_ID': inputJson._orgId,
            'IS_CUSTOMER_UPDATE': 'N',
            'ATTACHMENT_ID': inputJson._fileId
        };
        var datajson = {
            'ds': 'commCommentsRef',
            'operation': operation,
            'data': dataItem
        };
        BSService.save({
            'method': 'update'
        }, datajson, function(result) {
            callback(result);
        });
    };
    this.addComment = function(inputJson, callback) {
        var operation = "INSERT";
        var _activityName = inputJson.comment;
        if (_activityName.length > 250) {
            _activityName = _activityName.substring(0, 240);
        }
        datajson = {
            'ds': 'commActivitiesRef',
            'operation': 'INSERT',
            'data': {
                'SOURCE_OBJECT_ID': inputJson.actId,
                'ACTIVITY_NAME': _activityName,
                'ACTIVITY_TYPE_ID': 0,
                'APP_ID': inputJson._appId,
                'ORG_ID': inputJson._orgId,
                //'CREATION_DATE': new Date(),
                'CREATED_BY': inputJson._uId,
                'LAST_UPDATED_BY': inputJson._uId,
                // 'LAST_UPDATE_DATE': new Date(),
                'isGenIds': "Y"
            }
        };
        BSService.save({
            'method': 'update'
        }, datajson, function(result) {
            if (result.status === "E") {
                notify({
                    message: result.title + ' - ' + result.errorMsg,
                    classes: 'alert-danger'
                });
            } else {
                var _genIds = result.ids;
                addOnlyComments(inputJson, callback);
            }
        });
    };
    this.getComments = function(input, callback) {
        var inputJSON = {
            'ds': 'deGetCommentsRefV',
            'executeCountSql': 'N'
        };
        inputJSON.wC = "ACTIVITY_ID = ? and APP_ID = ? and ORG_ID = ?";
        inputJSON.oB = "CREATION_DATE DESC";
        inputJSON.params = [input.actId, input._appId, input._orgId];
        BSService.query({
            'method': 'data'
        }, inputJSON, function(result) {
            callback(result);
        });
    };
});
var baseUrl = _appUrl + "/api/";
var importUrl = _appUrl + "/import";
var exportUrl = _appUrl + "/export/?isTemplate=N";
var attachUrl = _appUrl + "/aservice";
mymobile3.factory('ExportService', function($resource) {
    return $resource(exportUrl, {
        '8180': ':8180'
    }, {
        query: {
            method: 'POST',
            params: {},
            isArray: false
        },
        save: {
            method: 'POST',
            params: {},
            isArray: false
        },
        invoke: {
            method: 'POST',
            params: {},
            isArray: false
        },
        saveAll: {
            method: 'POST',
            params: {},
            isArray: true
        }
    });
});
mymobile3.factory('BSService', function($resource) {
    return $resource(baseUrl + ':method', {
        '8180': ':8180'
    }, {
        query: {
            method: 'POST',
            params: {},
            isArray: false
        },
        save: {
            method: 'POST',
            params: {},
            isArray: false
        },
        invoke: {
            method: 'POST',
            params: {},
            isArray: false
        },
        saveAll: {
            method: 'POST',
            params: {},
            isArray: true
        }
    });
});
var infoTemplate =  'common/notify.html';
mymobile3.service('AlertService', function(SweetAlert,notify) {
    this.showError = function(errTitle, errMessage) {
        SweetAlert.swal({
            title: errTitle,
            text: errMessage,
            type: "warning"
        });
    }
    this.showInfo = function(title, message) {
        SweetAlert.swal({
            title: title,
            text: message,
            type: "info"
        });
    }
    this.showNotifyError =  function(title) {
         notify({ message: title ,
                     classes: 'alert-danger', 
                     templateUrl: infoTemplate});
    }
    this.showNotifyWarning =  function(title) {
         notify({ message: title ,
                     classes: 'alert-warning', 
                     templateUrl: infoTemplate});
    }
    this.showNotifySuccess =  function(title) {
         notify({ message: title ,
                     classes: 'alert-success', 
                     templateUrl: infoTemplate});
    }
    
    this.showNotifyInfo =  function(title) {
         notify({ message: title ,
                     classes: 'alert-info', 
                     templateUrl: infoTemplate});
    }
    
});
mymobile3.service('AppService', function(notify, BSServiceUtil, AlertService, Cache) {
    this.getAppConstants = function(constName) {
        var callback = function(result) {
            if (result && result.length > 0) {
                return result[0].VAR_CODE;
            } else {
                AlertService.showError("App Error", "No value found for " + constName);
            }
        }
        BSServiceUtil.queryResultWithCallback("deAppEnvVarRef", "_NOCACHE_", "VAR_NAME = ? and APP_ID = ?", [constName, Cache.loggedInUserAppId()], undefined, callback);
    }
    this.getCountries = function(callercb) {
        var callback = function(result) {
            if (result && result.length > 0) {
               callercb(result);
            } else {
                AlertService.showError("App Error", "Error while getting countries list");
            }
        }
        BSServiceUtil.queryResultWithCallback("DeCountriesRef", "_NOCACHE_", undefined,undefined, undefined, callback);
    }
    
    this.getStates = function(callbackb,wC,wCParams) {
        var callback = function(result) {
            if (result && result.length > 0) {
               callbackb(result);
            } else {
                AlertService.showError("App Error", "Error while getting states list");
            }
        }
        BSServiceUtil.queryResultWithCallback("DeStatesRef", "_NOCACHE_", wC,wCParams, undefined, callback);
    }
    
    this.getLookupValue = function(lookuptype, lookupcode) {
        var _lookpus = this.getStaticLookups(lookuptype);
        if (_lookpus) {
            for(var i = 0 ; i < _lookpus.length; i++) {
              if(_lookpus[i].id === lookupcode) {
                 return _lookpus[i].value;
              }
            }
        }
    }
});
mymobile3.service('Cache', function() {
    var map;
    this.getRawValue = function(key) {
        return localStorage.getItem(key);
    };
    this.init = function() {
        if (map) {
            return;
        }
        if (localStorage.getItem('Cache')) {
            map = angular.fromJson(localStorage.getItem('Cache'));
        } else {
            map = {};
        }
    };
    this.get = function(k) {
        this.init();
        return map[k];
    };
    this.put = function(k, v) {
        this.init();
        map[k] = v;
        localStorage.setItem('Cache', angular.toJson(map));
        return map[k];
    };
    this.remove = function(k) {
        this.init();
        delete map[k];
        localStorage.setItem('Cache', angular.toJson(map));
    };
    this.loggedInUser = function() {
        if(localStorage.$_u) {
            return JSON.parse(angular.fromJson(localStorage.$_u));
        }
    };
    this.loggedInUserAppId = function() {
        var _xUser = this.loggedInUser();
        return _xUser.appId;
    };
    this.loggedInRole = function() {
        var _xUser = this.loggedInUser();
        return _xUser.appRoles;
    }
});


