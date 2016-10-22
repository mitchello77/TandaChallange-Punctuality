$(function() { // We are ready!
    console.log( "Jquery " + $.fn.jquery );

    $.getJSON("http://localhost:4567/shift/2013-09-15", function( data ) {
      $.each( data[0], function( key, val ) {
        console.log(key + ":" + val);
      });
    });



    // Init Gauge
    var canvas = document.getElementById("gauge");
    init_gauge(canvas,100);
});
