import * as echarts from 'echarts';

export function createSpeedChart(containerId, events, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  const chart = echarts.init(container, 'dark');
  const data = [];

  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    const speed = evt.op_speedKmh !== null ? evt.op_speedKmh : evt.speed;
    const time = evt.timestamp ? new Date(evt.timestamp) : null;
    data.push({
      index: i,
      speed: speed !== null ? speed : 0,
      time
    });
  }

  if (data.length === 0) {
    chart.dispose();
    return null;
  }

  const xData = data.map(d => {
    if (d.time && !isNaN(d.time.getTime())) {
      return d.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    return d.index.toString();
  });

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter(params) {
        const p = params[0];
        const d = data[p.dataIndex];
        let text = `<b>${p.axisValue}</b><br/>Speed: ${p.value} km/h`;
        if (d.time) {
          text += `<br/>Time: ${d.time.toLocaleTimeString('en-GB')}`;
        }
        return text;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLabel: { rotate: 45, fontSize: 9, interval: Math.max(1, Math.floor(xData.length / 20)) },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: 'Speed (km/h)',
      min: 0,
      axisLabel: { fontSize: 10 }
    },
    series: [{
      type: 'line',
      data: data.map(d => d.speed),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: '#4fc3f7' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(79, 195, 247, 0.3)' },
          { offset: 1, color: 'rgba(79, 195, 247, 0.02)' }
        ])
      }
    }]
  });

  window.addEventListener('resize', () => chart.resize());

  return chart;
}
