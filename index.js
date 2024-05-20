
class LineAnimation {

    constructor (id, options) {

        const {
            playing = false, autoStart = true, loop = false,
            dashLength = 1, 
            duration = 1000, 
            headColor = `rgba(0,0,0,1)`, tailColor =`rgba(0,0,0,1)`,  backgroundColor = `rgba(0,0,0,0)`,
            headWidth = 1, tailWidth = 1,
            geojson = {
                "type": "FeatureCollection",
                "features": []
            }
        } = options;

        Object.assign(this, {

            id,
            geojson,

            playing, autoStart, loop,
            startTime: 0,

            duration,

            progressDelta: 0,
            dashLength, 
            headWidth, tailWidth,
            headColor, tailColor, backgroundColor
        })

        return this
    }

    addTo(map) {

        this.map = map;
        const {id, geojson, autoStart, backgroundColor} = this;

        map.addLayer({
            id,
            type: 'line',
            source: {
                data: geojson,
                type: 'geojson',
                lineMetrics: true
            },
            paint: {
                'line-width':10,
                'line-color': backgroundColor,
                'line-width-transition': {
                    duration:0
                }
            }
        })

        if (autoStart) this.play()
        return this
    }

    play() {

        if (!this.playing) {
            this.playing = true;

            this.startTime = document.timeline.currentTime;
            requestAnimationFrame(this.tick.bind(this))
        }

    }

    pause() {
        this.playing = false;
    }

    setProgress(dashProgress) {

        const {id, dashLength, headColor, tailColor, backgroundColor, headWidth, tailWidth, map} = this;

        const justABit = 0.0000000001;

        let dash; 

        // at start, only background is visible
        if (dashProgress===0) {
            dash = [1, backgroundColor]
        }

        // from start until head touches the end,

        else {

            const trailingGapLength = Math.max(0, dashProgress-dashLength);
            const [trailingGap, tail, head, leadingGap] = [
                [trailingGapLength, backgroundColor],
                [trailingGapLength + justABit, tailColor],
                [dashProgress, headColor],
                [dashProgress+justABit, backgroundColor],
            ];

            if (dashProgress<=1) {

                // if tail is in view, prepend gradient with a section of background color
                // with the length of the starting gap
                if (trailingGapLength) dash = [...trailingGap, ...tail, ...head, ...leadingGap];
                else dash = [0, tailColor, ...head, ...leadingGap];
                
            }

            // if dash head is past the end
            else {
                dash = [
                    ...trailingGap,
                    ...tail,
                    ...head, // head
                ];
            }
        }

        map.setPaintProperty(
            id, 
            'line-gradient',
            [
                'interpolate',
                ['linear'],
                ['line-progress'],
               ...dash        
            ]
        )

        // interpolate width
        if (headWidth-tailWidth) {
            let width = Math.sin(Math.PI*dashProgress/(dashLength+1))*(headWidth-tailWidth)
            map.setPaintProperty(id, 'line-width', tailWidth+width)
        }

        return this
    }

    calculateProgress(now) {
        const {duration, dashLength, startTime, progressDelta } = this;
        this.currentProgress = (progressDelta + (1 + dashLength)*(now%duration) / duration);
        // console.log(this.currentProgress)
        return this.currentProgress
    }

    
    tick(now) {

        const {playing, loop} = this;

        if (!playing) return

        let dashProgress = this.calculateProgress(now);
        if (!loop) dashProgress = Math.min(dashProgress,1)
        this.setProgress(dashProgress)
        if (loop || dashProgress<1) requestAnimationFrame(this.tick.bind(this))

        return this
    }


}
