/************************************************************************
 Weather data furnished by OpenWeatherMap.org (https://openweathermap.org/terms)
************************************************************************/ 


// global vars
var cities = [];
var APIKey = "2260db9c5b04a7ef96e84dc219ae31be";
var country = "us";

 

// 3 AJAX calls to the OpenWeatherMap API Current, Daily and UVI, display data accordingly
function DisplayWeatherData (city, country){

    // current
     queryURLc = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&units=imperial&appid=" + APIKey;
     $.ajax({
        url: queryURLc,
        method: "GET"
    }).then(function(response) {
        console.log(queryURLc);
        console.log(response);

        var dt = getDate(response.dt);

        var icon = response.weather[0].icon;
        var wURL = "http://openweathermap.org/img/wn/" + icon + ".png";
        
        var c = $("<h2>" + city + " ("+ dt +")<img src='"+ wURL +"'>  </h2>");
        $("#current-forecast").append(c);  
        
        var t = $("<div class='smalltype'>Temperature: " + response.main.temp.toFixed(1) + "&#8457;</div>");
        $("#current-forecast").append(t); 

        var h = $("<div class='smalltype'>Humidity: " + response.main.humidity + "%</div>");
        $("#current-forecast").append(h); 

        var w = $("<div class='smalltype'>Wind Speed: " + response.wind.speed.toFixed(1) + " MPH</div>");
        $("#current-forecast").append(w); 


        // UVI (need lat & lon from current response)
        var lat = response.coord.lat;
        var lon = response.coord.lon;
        
        queryURLu = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lat + "&lon=" + lon;
        $.ajax({
            url: queryURLu,
            method: "GET"
        }).then(function(responseUVI) {
           console.log(queryURLu);
           console.log(responseUVI);


            if(responseUVI.value >=7 ) {
                var spnCl = "uvi-bad";
            }
            else if (responseUVI.value >= 4 && responseUVI.value <= 6 ){
                var spnCl = "uvi-good";
            }
            else {
                var spnCl = "uvi-excellent";
            }
           
            var u = $("<div class='smalltype'>UV Index: <span class=" + spnCl + ">" + responseUVI.value + "</spn>");
            $("#current-forecast").append(u);            
         });
         
     });         

     // daily 
    queryURLd = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "," + country + "&units=imperial&appid=" + APIKey;
    $.ajax({
        url: queryURLd,
        method: "GET"
    }).then(function(responseDaily) {
        console.log(queryURLd);
        console.log(responseDaily);
        var dateHold = 0;
        var dtYMD    = 0;
        var currYMD = parseInt(getDateMMDDYYYY(responseDaily.list[0].dt));
        var printed  = 1;
        
        
        for(var i=0; i<responseDaily.cnt; i++){
            //console.log("timestamp: " + responseDaily.list[i].dt);
            var dt    = getDate(responseDaily.list[i].dt);
            var dtYMD = getDateMMDDYYYY(responseDaily.list[i].dt);
             //console.log("dates: "+ dateHold + " != " +  dtYMD + " printed "+ printed + " curYMD " + curYMD) ;

            if( (dateHold != dtYMD) && (printed < 6) && (currYMD != dtYMD) )
            {   
                if(dateHold === 0) {dateHold = dtYMD;} // first time in

                var icon = responseDaily.list[i].weather[0].icon;
                var temp = responseDaily.list[i].main.temp.toFixed(1) ;
                var humid = responseDaily.list[i].main.humidity.toFixed(1);
          
                var dayCol = $("<div class='col-sm-2 dayColExtra'>"); 
        
                var divInfo = $("<div class='each-day'>");
                dayCol.append(divInfo);

                var pDt = $("<p class='pStyle'>").text(dt);
                divInfo.append(pDt);

                var wURL = "http://openweathermap.org/img/wn/" + icon + ".png";        
                var icoN = $("<p class='pStyle'><img src='"+ wURL +"'>  </p>");
                pDt.append(icoN);

                var tmP = $("<p class='pStyle'>" + temp + "&#8457;</p>");
                icoN.append(tmP);
            
                var huM = $("<p class='pStyle'>" + humid + "%</p>");
                icoN.append(huM);

                $("#five-day-forecast").append(dayCol);

                dateHold = dtYMD;
                printed ++;
            }           

        }
        var col = $("<div class='col-sm-1'>"); // last column
        $("#five-day-forecast").append(col);
         
    });    
        
}   




// error check need to be better
function CheckCity (city, country){
  
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "," + country + "&units=imperial&appid=" + APIKey;
    $.ajax({
        type: "get", url: queryURL ,
        success: function (data, text) {
        },
        error: function (request, status, error) {
            console.log(request.responseText); 
            $(".warning").text("Looks like this city is not found. Try another.");           
        }
    });
   
}


// get date from unixtime stamp
function getDate(timestamp){
    var a = new Date(timestamp * 1000);
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();  
    var mdy = month + '/'  + date + '/'  + year  ;
    return mdy;
  }

  // get YYYYMMDD from timestamp
  function getDateMMDDYYYY(timestamp){
    var a = new Date(timestamp * 1000);
    var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    var yr  = a.getFullYear();
    var mth = months[a.getMonth()];
    var dy  = a.getDate();  
    parseInt(mth);
    parseInt(dy);
    parseInt(yr);
    var mdy = yr;
    mdy += mth;
    mdy += dy;
    return mdy;
  } 


 // check if search word submitted, clean it, 
 //check if it already in the array if ok add to array and push to local storage 
 // some error checking
 $("#add-city").on("click", function(event) {
    event.preventDefault();
    var city = $("#city-input").val().trim();

    if(city==="") {
        $(".warning").text("You need to enter a city. Try another.");  
    return }

    city = CleanInput(city); 
    
    CheckCity (city, country);
    
    if (cities.indexOf(city) === -1) {    
        cities.unshift(city);
    }
      else {
        $(".warning").text("You already have this city in your list. Try another.");  
        return 
    }
 
    localStorage.setItem("MyCities", JSON.stringify(cities));

    renderCities();
  });


// fumction to clean  up user input a little  
function CleanInput(str) {
    str.trim();  
    var words = str.toLowerCase().split(' ');
    for (var i = 0; i < words.length; i++) {
    words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);     
    }
    cleanWord = words.join(' '); 
    
    return cleanWord;
} 



// listener gets city from button calls fumction to display weather data
$(document).on("click", ".city-btn", function(){
    event.preventDefault();
    var city = $(this).attr("data-name");
    console.log("city button presssed: " +city);
    $("#current-forecast, #ive-day-forecast,  .each-day, .pStyle, .dayColExtra, .warning").empty();
    DisplayWeatherData (city, country);
});




 // function  adds city buttons, clear div first, get cities from local storage if available
 // loop throuh cities and display
 function renderCities() {

    $("#city-view, #current-forecast, #ive-day-forecast, .each-day, .pStyle, .dayColExtra, .warning").empty();

    var cityArr  = JSON.parse(localStorage.getItem("MyCities"));

    if (cityArr !== null) {
        cities = cityArr;
    }
 
    // Loop through the array of cities 
    for (var i = 0; i < cities.length; i++) {

      var p = $("<div>"); 
      $("#city-view").append(p); 

      var a = $("<button>");
      a.addClass("city-btn");
      a.attr("data-name", cities[i]);  
      a.text(cities[i]);

      $("#city-view").append(a);
    }

    init();
  }


// pulls last searched city from array or if  empty message to start
function init() {   
  
    if(cities.length > 0) {
        curCity = cities[0];
        DisplayWeatherData (curCity, country);
    } else {
        var start = $("<h5 style='color: grey'>Please search for any US city to start.</h5>");
        $("#current-forecast").append(start); 
    }
}  



renderCities();


 


