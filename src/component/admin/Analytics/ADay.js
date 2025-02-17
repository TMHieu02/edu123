import React, { useEffect, useRef, useState } from 'react';
import Header from "../Header/Header";
import axiosClient from "../../../api/axiosClient";


const Aday = () => {
  const pieChartRef = useRef(null);
  useEffect(() => {
    const loadGoogleCharts = async () => {
      // Check if google charts library is already loaded
      if (window.google && window.google.charts) {
        drawChart();
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
          window.google.charts.load('current', { packages: ['corechart'] });
          window.google.charts.setOnLoadCallback(drawChart);
        };
        document.body.appendChild(script);
      }
      
      
    };

    const drawChart = async () => {
       // Lấy ngày hiện tại
       const currentDate = new Date();
       // Định dạng ngày theo DD-MM-YYYY
       const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`.replace(/(?<=^|\/)(\d)(?=\/|$)/g, '0$1');
     
       // Sử dụng biến formattedDate trong URL
       const response = await axiosClient.get(`/courseRegisters/total-sold-in-day/${formattedDate}`);
      console.log(response.data);
      // setTotalCouse(response.data);
      // Ensure the google object is available in the window scope
      const google = window.google;
      const data = new google.visualization.DataTable();
      data.addColumn('string', 'Element');
      data.addColumn('number', 'Percentage');
      data.addRows([
        ['Sold', response.data],
      ]);

      // Ensure the DOM element is available
      if (pieChartRef.current) {
        const chart = new google.visualization.ColumnChart(pieChartRef.current);
        chart.draw(data, null);
      }
    };

    loadGoogleCharts();

    // Cleanup function to remove the script tag
    return () => {
      const script = document.querySelector('script[src="https://www.gstatic.com/charts/loader.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return(
  <div> 
    <Header/>
    <div ref={pieChartRef} style={{ width: '100%', height: '500px' }} />
  </div>);
};

export default Aday;