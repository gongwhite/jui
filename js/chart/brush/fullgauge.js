jui.define("chart.brush.fullgauge", ["util.math"], function(math) {

	/**
	 * @class chart.brush.fullgage
	 * implements full gauge brush
	 * @extends chart.brush.fullgauge
	 */
	var FullGaugeBrush = function(chart, axis, brush) {
		var self = this, textY = 5;
        var w, centerX, centerY, outerRadius, innerRadius, textScale;

		function createText(value, unit) {
			var g = chart.svg.group().translate(centerX, centerY);

            g.append(chart.text({
                "text-anchor" : "middle",
                "font-size" : chart.theme("gaugeFontSize"),
                "font-weight" : chart.theme("gaugeFontWeight"),
                "fill" : self.color(0),
                y: textY
            }, value + unit).scale(textScale));

			return g;
		}

        function createTitle(title, dx, dy) {
            var g = chart.svg.group().translate(centerX + dx, centerY + dy),
                anchor = (dx == 0) ? "middle" : ((dx < 0) ? "end" : "start");

            g.append(chart.text({
                "text-anchor" : anchor,
                "font-size" : chart.theme("gaugeTitleFontSize"),
                "font-weight" : chart.theme("gaugeTitleFontWeight"),
                y: textY
            }, title).scale(textScale));

            return g;
        }

		this.drawUnit = function(index, data, group) {
			var obj = axis.c(index),
				value = data.value || 0,
                title =data.title || "",
				max = data.max || 100,
				min =data.min || 0,
				unit = data.unit || "";

			var rate = (value - min) / (max - min),
				currentAngle = Math.abs(brush.startAngle - brush.endAngle) * rate;

			if (brush.endAngle >= 360) {
				brush.endAngle = 359.99999;
			}

			var width = obj.width,
				height = obj.height,
				x = obj.x,
				y = obj.y;

			// center
			w = Math.min(width, height) / 2;
			centerX = width / 2 + x;
			centerY = height / 2 + y;
			outerRadius = w - brush.size;
			innerRadius = outerRadius - brush.size;
            textScale = this.getScaleValue(w, 40, 400, 1, 1.5);

			group.append(this.drawDonut(centerX, centerY, innerRadius, outerRadius, brush.startAngle + currentAngle, brush.endAngle, {
				stroke : chart.theme("gaugeBackgroundColor"),
				fill : "transparent"
			}));

			group.append(this.drawDonut(centerX, centerY, innerRadius, outerRadius, brush.startAngle, currentAngle, {
				stroke : this.color(0),
				fill : "transparent"
			}));

            if(brush.showText) {
                group.append(createText(value, unit));
            }

            if(title != "") {
                group.append(createTitle(title, brush.titleX, brush.titleY));
            }

			return group;
		}

		this.draw = function() {
			var group = chart.svg.group();

			this.eachData(function(i, data) {
				this.drawUnit(i, data, group);
			});

			return group;

		}
	}

	FullGaugeBrush.setup = function() {
		return {
            size: 60,
            startAngle: 0,
            endAngle: 300,
            showText: true,
            titleX: 0,
            titleY: 0
		};
	}

	return FullGaugeBrush;
}, "chart.brush.donut");
