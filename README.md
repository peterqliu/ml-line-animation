
  

# ml-line-animation

  

Animate lines with a sliding effect, with customization for color, lengths, and speed. Leverages the vanilla `line-gradient` property of Maplibre GL/Mapbox GL, with no other dependencies.

  

## API


<b>`new LineAnimation(id{, options})`

  

Instantiates a new LineAnimation.

`id`: name of line layer
`options`: optional object of line parameters:

  

| key | default | function|
|--|--|--|
| dashLength | 1 | Length of the dash, as a proportion of total line geometry. Value 0-1.|
| geojson | (empty geojson) | GeoJSON object, or URL to one. Geometry should probably contain some `LineString` or `Polygon` geometry to appear properly. Can be modified later with `map.getSource(id).setData(data)`|
|<i>Style|
| headColor | `black` | Color of the leading end of dash |
| tailColor | `black` | Color of the trailing end of dash. If different from head, color will interpolate naturally via `line-gradient` implementation |
| backgroundColor | `rgba(0,0,0,0)` | Color of line in absence of dash|
| headWidth | 1 | Width of line when dash head is at the geometry's terminus (when dashProgress == 1). |
| tailWidth | 1 | Width of line when dash tail is at the geometry's terminus |
|<i>Animation|
| duration | 1000 | Duration of animation, in milliseconds. Animation begins when dash head is at the geometry's beginning, and ends when tail is at the geometry terminus|
| autoStart | `true` | Boolean stating whether animation starts when line is added to the map |
| loop | `false` | Boolean specifying whether animation loops after the first run. If true, progress is also capped at 1 |

<b>`LineAnimation.addTo(map)`</b>
Add line layer to the map.

<b>`LineAnimation.play()`</b>
Starts/resumes the line animation. Will need this when instantiating LineAnimation with `{autoStart:false}`.

<b>`LineAnimation.pause()`</b>
Pauses the animation.

<b>`LineAnimation.setProgress(progress)`</b>
Set a specific `progress` value. To keep it at this position, recommend first pausing the animation (or instantiating it with `autoStart: false`).

  

## Anatomy of a dash

LineAnimation consists of a single dash segment, moving in the direction of the underlying geojson line geometry. Note the tail, head, and background positions to apply color styling.
```
●------------LINE GEOMETRY (WEST TO EAST)--------------●
---------------- ▷▷▷▷▷▷▷▷ DASH ▷▷▷▷▷▷▷▶ ----------------
<--background--> ^tail            head^ <--background-->
```

## Animation mechanics

```		 
●------------LINE GEOMETRY (WEST TO EAST)--------------●
---------------- ▷▷▷▷▷▷▷▷ DASH ▷▷▷▷▷▷▷▶ ----------------

                 |----------A---------|			 
|------------------B------------------|			 
|---------------------------C--------------------------|	
```




#### length (A / C)

Dash length is expressed as a proportion of the total geometry, a value from 0 to 1. This is defined when instantiating the line layer, and does not change.

Regardless of dash length, there is a gap of length `1` between dashes. This means only one dash is visible at any given time, and in a looping animation, enters right as the previous dash exits.

  

#### progress (B / C)

Animation state is tracked predominantly as `progress`, which denotes the dash head's position <i>proportionally</i> and <i>relative</i> to the length of the line geometry. This value increases as the line animates, until it reaches the max value.

`progress` ranges from 0, where the head is right about to slide into view, to `(1+dashLength)`, where the tail has just slid out and the next dash is about to enter. These two states bookend the cycle, and are thereby identical.

  