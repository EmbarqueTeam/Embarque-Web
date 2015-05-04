
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


Parse.Cloud.beforeSave("Feedback", function(request, response) {
    Parse.Cloud.useMasterKey();
    
    var ownFields = new Array();
    ownFields.push(request.object.get("conservation"));
    ownFields.push(request.object.get("food"));
    ownFields.push(request.object.get("information"));
    ownFields.push(request.object.get("punctuality"));
    ownFields.push(request.object.get("security"));
    ownFields.push(request.object.get("wifi"));
    
    var ownAverage = getAverageFromArray(ownFields);
    
    var postACL = new Parse.ACL();
    postACL.setPublicReadAccess(true);
    postACL.setPublicWriteAccess(false);
    request.object.setACL(postACL);
    
    request.object.set("average", ownAverage);
    response.success();
});

Parse.Cloud.afterSave("Feedback", function(request) {
    Parse.Cloud.useMasterKey();
    
    var airport = request.object.get("airport");
    if (airport != undefined){
        var query = new Parse.Query("Feedback");
        query.equalTo("airport", airport);
        query.limit(100);
        query.descending("createdAt");
        query.find({
            success: function(results) {
                var rateConservation = getAverageFromObjects(results, "conservation");
                var rateFood = getAverageFromObjects(results, "food");
                var rateInformation = getAverageFromObjects(results, "information");
                var ratePunctuality = getAverageFromObjects(results, "punctuality");
                var rateSecurity = getAverageFromObjects(results, "security");
                var rateWifi = getAverageFromObjects(results, "wifi");
                
                //var array = [rateConservation, rateFood, rateInformation, ratePunctuality, rateSecurity, rateWifi];
                //var rateAverage = getAverageFromArray(array);
                //console.log([rateConservation, rateFood, rateInformation, ratePunctuality, rateSecurity, rateWifi, rateAverage]);   
                
                airport.set("conservation", rateConservation);
                airport.set("food", rateFood);
                airport.set("information", rateInformation);
                airport.set("punctuality", ratePunctuality);
                airport.set("security", rateSecurity);
                airport.set("wifi", rateWifi);
                airport.save();
            },
            error: function() {

            }
        });
    }else{
        console.log('airport is undefined');
    }
});

Parse.Cloud.beforeSave("Airport", function(request, response) {
    Parse.Cloud.useMasterKey();
    
    var ownFields = new Array();
    ownFields.push(request.object.get("conservation"));
    ownFields.push(request.object.get("food"));
    ownFields.push(request.object.get("information"));
    ownFields.push(request.object.get("punctuality"));
    ownFields.push(request.object.get("security"));
    ownFields.push(request.object.get("wifi"));
    
    var ownAverage = getAverageFromArray(ownFields);
    
    var base10 = getBase10Average(ownAverage);
    
    var postACL = new Parse.ACL();
    postACL.setPublicReadAccess(true);
    postACL.setPublicWriteAccess(false);
    request.object.setACL(postACL);
    
    request.object.set("rateAverage", base10);
    response.success();
});

function getAverageFromArray(results){
    var sum = 0;
    for (var i = 0; i < results.length; ++i) {
        var item = results[i];
        if (item != undefined && item >= -3 && item <= 3){
            sum += item;
        }else{
            console.log(item);
        }
    }
    var average = sum / results.length;
    return parseFloat(average.toFixed(2));
}

function getAverageFromObjects(results, field){
    var sum = 0;
    for (var i = 0; i < results.length; ++i) {
        var item = results[i].get(field);
        if (item != undefined && item >= -3 && item <= 3){
            sum += item;
        }
    }
    var average = sum / results.length;
    return parseFloat(average.toFixed(2));
}

function getBase10Average(ave){
    var average = (((ave+3)/6)*10);
    return parseFloat(average.toFixed(2));
}