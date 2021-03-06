jui.define("chart.brush.donut", [ "util.base", "util.math" ], function(_, math) {

    /**
     * @class chart.brush.donut 
     * 
     * implements donut brush 
     *  
     * @extends chart.brush.core  
     * 
     */
	var DonutBrush = function() {
        var w, centerX, centerY, startY, startX, outerRadius, innerRadius;

        /**
         * @method drawDonut 
         *  
         * @param {Number} centerX
         * @param {Number} centerY
         * @param {Number} innerRadius
         * @param {Number} outerRadius
         * @param {Number} startAngle
         * @param {Number} endAngle
         * @param {Object} attr
         * @param {Boolean} hasCircle
         * @return {util.svg.element}
         */
		this.drawDonut = function(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, attr, hasCircle) {
		    hasCircle = hasCircle || false;

			attr['stroke-width']= outerRadius - innerRadius;

			var g = this.chart.svg.group(),
				path = this.chart.svg.path(attr),
				dist = Math.abs(outerRadius - innerRadius);

			// 바깥 지름 부터 그림
			var obj = math.rotate(0, -outerRadius, math.radian(startAngle)),
				startX = obj.x,
				startY = obj.y;


			// 시작 하는 위치로 옮김
			path.MoveTo(startX, startY);

			// outer arc 에 대한 지점 설정
			obj = math.rotate(startX, startY, math.radian(endAngle));

			// 중심점 이동
			g.translate(centerX, centerY);

			// outer arc 그림
			path.Arc(outerRadius, outerRadius, 0, (endAngle > 180) ? 1 : 0, 1, obj.x, obj.y);

			g.append(path);

            if(hasCircle) {
                var centerCircle = math.rotate(0, -innerRadius - dist/2, math.radian(startAngle)),
					cX = centerCircle.x,
					cY = centerCircle.y,
					centerCircleLine = math.rotate(cX, cY, math.radian(endAngle));
    
                var circle = this.chart.svg.circle({
                    cx : centerCircleLine.x,
                    cy : centerCircleLine.y,
                    r : dist/2,
                    fill  : attr.fill
                });
                
                g.append(circle);
    
                var circle2 = this.chart.svg.circle({
                    cx : centerCircleLine.x,
                    cy : centerCircleLine.y,
                    r : 3,
                    fill  : "white"
                });
                
                g.append(circle2);
            }

			return g;
		}

        this.drawBefore = function() {
            var width = this.chart.area('width'),
                height = this.chart.area('height'),
                min = width;

            if(height < min) {
                min = height;
            }

            // center
            w = min / 2;
            centerX = width / 2;
            centerY = height / 2;
            startY = -w;
            startX = 0;
            outerRadius = Math.abs(startY) - this.brush.size;
            innerRadius = outerRadius - this.brush.size;
        }

		this.draw = function() {
			var group = this.chart.svg.group();

			var target = this.brush.target,
				data = this.getData(0);

			var all = 360,
				startAngle = 0,
				max = 0;

			for(var i = 0; i < target.length; i++) {
				max += data[target[i]];
			}

			for(var i = 0; i < target.length; i++) {
				var value = data[target[i]],
					endAngle = all * (value / max);

				var g = this.drawDonut(centerX, centerY, innerRadius, outerRadius, startAngle, endAngle, {
					fill : 'transparent',
					stroke : this.color(i)
				});

                if(this.brush.showText) {
                    var series = this.chart.get("series", target[i]),
                        dText = ((series.text != "") ? series.text : target[i]) + ": " + value,
                        cText = (this.brush.format) ? this.format(target[i], value) : dText,
                        text = this.drawText(centerX, centerY, startAngle + (endAngle / 2) - 90, outerRadius + this.brush.size / 2, cText);

                    this.addEvent(text, 0, i);
                    group.append(text);
                }

                this.addEvent(g, 0, i);
				group.append(g);

				startAngle += endAngle;
			}

            return group;
		}
	}

	DonutBrush.setup = function() {
		return {
            /** @cfg {Number} [size=50] donut stroke width  */
			size: 50
		};
	}

	return DonutBrush;
}, "chart.brush.pie");
