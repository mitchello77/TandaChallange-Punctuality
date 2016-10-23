// A quick little gauge using HTML 5 canvas!
  init_gauge = function(canvas,_degrees) {
    //Variables
  	var ctx = canvas.getContext("2d");
  	var W = canvas.width;
  	var H = canvas.height;
  	var degrees = _degrees;
    var linewidth = 15;
  	var color = "#009ED9";
    var bgcolor = "#E9F5F6";
  	var text;

    //Clear
    ctx.clearRect(0, 0, W, H);

    // Arc radius
    var radius = (W/2) - linewidth;
    //Background 360 degree arc
    ctx.beginPath();
    ctx.strokeStyle = bgcolor;
    ctx.lineWidth = 15;
    ctx.arc(W/2, H/2, radius, 0, Math.PI*2, false);
    ctx.stroke();
    // Foreground arc
    var radians = degrees * Math.PI / 180; // Gotta be in radians
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 15;
    // Arcs start at the right by default, minus 90deg to start at the top!
    ctx.arc(W/2, H/2, radius, 0 - 90*Math.PI/180, radians - 90*Math.PI/180, false);
    ctx.stroke();
    //Lets add some text in the middle
    ctx.fillStyle = color;
    ctx.font = "600 30px Open Sans";
    text = Math.floor(degrees/360*100) + "%";
    text_width = ctx.measureText(text).width;
    ctx.fillText(text, W/2 - text_width/2, H/2+10);
  };
