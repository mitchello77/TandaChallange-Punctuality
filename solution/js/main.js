// Variables
var DataServer = "http://localhost:4567";
var EmployeeStats = new Object();

$(function() { // We are ready!
    console.log( "Jquery " + $.fn.jquery );
    // Init Employee Stats
    EmployeeStats.leave_ontime = 0;
    EmployeeStats.leave_early = 0;
    EmployeeStats.leave_late = 0;
    EmployeeStats.arrive_ontime = 0;
    EmployeeStats.arrive_late = 0;
    EmployeeStats.arrive_early = 0;
    EmployeeStats.totalrosters = 0;
    EmployeeStats.minutessaved = 0;
    //Init Datatable
    buildTable('2013-09-15','2014-06-07');

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
    var table = document.getElementById("datatable");
    var tableBodyRef = table.getElementsByTagName('tbody')[0];

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
          var obj = new Object();
          obj.date = date;
          if (found == true) {
            obj.rosterstart = arrRows[index].rosterstart;
            obj.rosterfinish = arrRows[index].rosterfinish;
            obj.shiftstart = ShiftData[i].start || "Missing";
            obj.shiftfinish = ShiftData[i].finish || "Missing";
            // update entry with merged data
            arrRows[index] = obj;
          } else {
            // no roster data
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
     for (var k=0; k<arrRows.length; k++) {
       var startlate = false,
           finishearly = false,
           start_diffmins,
           finish_diffmins;
       // Get Employee start
       var rs = arrRows[k].rosterstart;
       var rf = arrRows[k].rosterfinish;
       var ss = arrRows[k].shiftstart;
       var sf = arrRows[k].shiftfinish;
       if (rs != "Missing" && rf != "Missing") {
         EmployeeStats.totalrosters++;
       }
       if (rs != "Missing" && ss != "Missing") {
         var m_rs = moment(rs);
         var m_ss = moment(ss);
         if (m_rs.isSame(m_ss, 'minutes') == true) {
           EmployeeStats.arrive_ontime++;
         } else if (Math.abs(m_rs.diff(m_ss, 'minutes')) <= 30) {
           if (m_ss.isAfter(m_rs, 'minutes') == true) {
             start_diffmins = Math.abs(m_rs.diff(m_ss, 'minutes'));
             EmployeeStats.arrive_late++;
             startlate = true;
             EmployeeStats.minutessaved = EmployeeStats.minutessaved + start_diffmins;
           } else {
             EmployeeStats.arrive_early++;
           }
         }
       }
       if (rf != "Missing" && sf != "Missing") {
         var m_rf = moment(rf);
         var m_sf = moment(sf);
         if (m_rf.isSame(m_sf, 'minutes') == true) {
           EmployeeStats.leave_ontime++;
         } else if (Math.abs(m_rf.diff(m_sf, 'minutes')) <= 30) {
           if (m_sf.isBefore(m_rf, 'minutes') == true) {
             finish_diffmins = Math.abs(m_rf.diff(m_sf, 'minutes'));
             EmployeeStats.leave_early++;
             finishearly = true;
             EmployeeStats.minutessaved = EmployeeStats.minutessaved + finish_diffmins;
           } else {
             EmployeeStats.leave_late++;
           }
         }
       }
      var row = tableBodyRef.insertRow(tableBodyRef.rows.length);
      var cell_date = row.insertCell(0);
      var cell_rosterStart = row.insertCell(1);
      var cell_shiftStart = row.insertCell(2);
      var cell_rosterFinish = row.insertCell(3);
      var cell_shiftFinish = row.insertCell(4);
      cell_date.innerHTML = buildcell(arrRows[k].date,"MMMM Do YYYY");
      cell_rosterStart.innerHTML = buildcell(rs,"h:mma");
      cell_rosterFinish.innerHTML = buildcell(rf,"h:mma");
      cell_shiftStart.innerHTML = buildcell(ss,"h:mma", startlate, start_diffmins);
      cell_shiftFinish.innerHTML = buildcell(sf,"h:mma", finishearly, finish_diffmins);
    }
    // all done with getting and setting the data
    $('.loader').addClass('hidden'); // hide the preloader
    // Init Statistics
    init_stats();
    // do pagnation and sorting.
    $('#datatable').dynatable({
      features: {
        recordCount: false
      }
    });
  });

  buildcell = function(date, dateFormat, notontimebool, diffmins) {
    var html;
    var html_missing = '<div class="missing">No Clock In/Out</div>'
    if (date != "Missing") {
      var m = moment(date);
      if (m.isValid()) {
        if (notontimebool === undefined) {
          notontimebool = false;
        }
        if (notontimebool == true) {
          // arrived late or left early
          html = '<div class="late">'+moment(date).format(dateFormat)+'<span class="mins">'+ diffmins +' mins</span></div>';
        } else {
          // all good
          html = "<div>"+moment(date).format(dateFormat)+"</div>";
        }
      } else {
        html = html_missing
      }
    } else {
        html = html_missing
    }
    return html;
  }
};

init_stats = function() {
  var punctualcount = EmployeeStats.leave_ontime + EmployeeStats.leave_late + EmployeeStats.arrive_ontime + EmployeeStats.arrive_early;
  var lateearlysum = EmployeeStats.arrive_late + EmployeeStats.leave_early;
  var punctualpercent;
  if (lateearlysum == 0) {
    punctualpercent = 1; // its 100%. No point doing any math.
  } else {
    // % difference of punctualcount and punctualcount-lateearlysum
     punctualpercent = (punctualcount-lateearlysum)/punctualcount
  }

  $('#arrivedlate').text(EmployeeStats.arrive_late);
  $('#punctual').text(punctualcount);
  $('#leftearly').text(EmployeeStats.leave_early);
  $('#timesaved').text(EmployeeStats.minutessaved);
  $('#punctualpercent').text(round(punctualpercent*100,1));

  // Init Gauge
  var canvas = document.getElementById("gauge");
  init_gauge(canvas,(punctualpercent*360));

  // Init Box Plot
  // Gets Random values for the box plot since I dont have any real data.
  var Q1, Q2, Q3;
  Q1 = getRandomInt(15, 40);
  Q2 = getRandomInt(35, 65);
  Q3 = getRandomInt(60, 85);
  while (Q1 == Q3) {
    Q1 = getRandomInt(15, 40);
    Q3 = getRandomInt(60, 85);
  }
  $('#boxplot .employee').css('left', (round(punctualpercent*100,1)-4.5)+'%'); // Real data.
  $('#boxplot .chart .box').css('left', Q1+'%').css('right',(100-Q3)+'%'); // Q1 & Q3
  $('#boxplot .chart .box-center').css('left', Q2+'%'); // Q2
};

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
