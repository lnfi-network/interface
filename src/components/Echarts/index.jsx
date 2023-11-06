
import { useRef } from 'react';
import ReactECharts from 'echarts-for-react';

// 在此组件中绘制一个简单的折线图
const ECharts = ({ refs, option = {} }) => {
  return (
    <>
      <ReactECharts autoResize={true} style={{ width: "100%", height: "100%" }} ref={refs} option={option} />
    </>
  );
};

export default ECharts;
