// Variables
var DataServer = "http://localhost:4567";

$(function() { // We are ready!
    console.log( "Jquery " + $.fn.jquery );
    //Init Datatable
    buildTable('2013-09-15','2014-06-07');
    // Init Gauge
    var canvas = document.getElementById("gauge");
    init_gauge(canvas,100);
});
//get and consolodates the data into rows
//dateFrom and dateTo AS Date
buildTable = function(dateFrom, dateTo) {
  var urlSuffix;
  var arrRows = []; //[{object},{object}...]

  if (dateTo !== undefined) {
    urlSuffix = "s/" + dateFrom + "/" + dateTo;
  } else {
    urlSuffix = "/" + dateFrom
  }
  $.when($.getJSON(DataServer + "/" + "roster" + urlSuffix), $.getJSON(DataServer + "/" + "shift" + urlSuffix)).done(function(Roster, Shift) {
    // get data array
    var RosterData = Roster[0],
        ShiftData = Shift[0];
    // dump all roster data
    for (var i=0; i<RosterData.length; i++) {
        var obj = new Object();
        obj.date = RosterData[i].date;
        obj.rosterstart = RosterData[i].start;
        obj.rosterfinish = RosterData[i].finish;
        obj.shiftstart = "Missing";
        obj.shiftfinish = "Missing";
        arrRows.push(obj)
    }

    // loop shifts
    if (ShiftData != null && ShiftData !== undefined) {
      for (var i=0; i<ShiftData.length; i++) {
        if (ShiftData[i] != null && ShiftData[i] !== undefined) {

          var date = ShiftData[i].date;
          var index;
          var found = false;
          // loop the added roster data
          for (var j=0; j<arrRows.length; j++) {
            if (arrRows[j].date == date) {
              //dates match
              index = j;
              found = true;
            }
          }

          if (found == true) {
            var obj = new Object();
            obj.date = date;
            obj.rosterstart = arrRows[index].rosterstart;
            obj.rosterfinish = arrRows[index].rosterfinish;
            obj.shiftstart = ShiftData[i].start || "Missing";
            obj.shiftfinish = ShiftData[i].finish || "Missing";
            // update entry with merged data
            arrRows[index] = obj;
          } else {
            // no roster data
            var obj = new Object();
            obj.date = date;
            obj.rosterstart = "Missing";
            obj.rosterfinish = "Missing";
            obj.shiftstart = ShiftData[i].start;
            obj.shiftfinish = ShiftData[i].finish;
            arrRows.push(obj)
          }
        }
      }
    }

    // Build the Table
    var table = document.getElementById("datatable");
     for (var i=0; i<arrRows.length; i++) {
      var row = table.insertRow(-1);
      var cell_date = row.insertCell(0);
      var cell_rosterStart = row.insertCell(1);
      var cell_rosterFinish = row.insertCell(2);
      var cell_shiftStart = row.insertCell(3);
      var cell_shiftFinish = row.insertCell(4);
      cell_date.innerHTML = buildcell(arrRows[i].date,"MMMM Do YYYY");
      cell_rosterStart.innerHTML = buildcell(arrRows[i].rosterstart,"h:mma");
      cell_rosterFinish.innerHTML = buildcell(arrRows[i].rosterfinish,"h:mma");
      cell_shiftStart.innerHTML = buildcell(arrRows[i].shiftstart,"h:mma");
      cell_shiftFinish.innerHTML = buildcell(arrRows[i].shiftfinish,"h:mma");
    }

  });

  buildcell = function(date, dateFormat) {
    console.log(date);
    var html;
    var html_missing = "<span>Missing</span>"
    if (date != "Missing") {
      var m = moment(date);
      if (m.isValid()) {
        html = "<span>"+moment(date).format(dateFormat)+"</span>";
      } else {
        html = html_missing
      }
    } else {
        html = html_missing
    }
    return html;
  }
};
