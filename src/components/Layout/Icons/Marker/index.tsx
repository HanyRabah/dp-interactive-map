const ICON = `M20.2,15.7L20.2,15.7c1.1-1.6,1.8-3.6,1.8-5.7c0-5.6-4.5-10-10-10S2,4.5,2,10c0,2,0.6,3.9,1.6,5.4c0,0.1,0.1,0.2,0.2,0.3
  c0,0,0.1,0.1,0.1,0.2c0.2,0.3,0.4,0.6,0.7,0.9c2.6,3.1,7.4,7.6,7.4,7.6s4.8-4.5,7.4-7.5c0.2-0.3,0.5-0.6,0.7-0.9
  C20.1,15.8,20.2,15.8,20.2,15.7z`;

const pinStyle = {
  cursor: "pointer",
  fill: "#0f282f",
  stroke: "#fff",
  strokeWidth: 3,
};

{/* <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="64px" height="64px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve">
<g>
	<path fill-rule="evenodd" clip-rule="evenodd" fill="#00AFD0" d="M56,28c-1.105,0-2-0.895-2-2c0-0.01-0.002-0.017-0.002-0.026
		c0-0.013,0.002-0.024,0.002-0.036C54,13.82,44.15,4,32,4s-22,9.82-22,21.938c0,0.012,0.002,0.023,0.002,0.036
		C10.002,25.983,10,25.99,10,26c0,0.056,0.007,0.111,0.01,0.167c0.005,0.427,0.026,0.861,0.065,1.302
		c0.167,2.529,0.739,4.945,1.689,7.169C16.116,46.682,27.37,59.75,32,59.75c3.321,0,10.01-6.69,15.145-14.901l0.012,0.007
		C47.529,44.34,48.133,44,48.819,44c1.135,0,2.056,0.919,2.056,2.056c0,0.468-0.162,0.895-0.427,1.241
		C44.551,56.592,36.608,64,32,64c-6.766,0-20.337-15.474-24.647-29.765c-0.661-1.985-1.089-4.075-1.251-6.242
		C6.041,27.321,6,26.652,6,26C6,11.642,17.642,0,32,0c14.359,0,26,11.642,26,26C58,27.105,57.105,28,56,28L56,28z M54,32
		c1.105,0,2,0.895,2,2s-0.895,2-2,2s-2-0.895-2-2S52.895,32,54,32L54,32z"/>
	<path fill-rule="evenodd" clip-rule="evenodd" fill="#FC3435" d="M32,42c-8.836,0-16-7.164-16-16c0-1.433,0.209-2.814,0.562-4.139
		c0.065-0.193,0.131-0.388,0.228-0.574c1.016-1.964,3.431-2.729,5.392-1.714c0.041,0.021,0.068,0.015,0.104,0.026
		C22.808,19.85,23.385,20,24,20c1.009,0,1.918-0.386,2.621-1.001l0.014,0.017c0.356-0.337,0.834-0.548,1.365-0.548
		c1.105,0,2,0.897,2,2c0,0.744-0.41,1.385-1.011,1.729c-2.485,2-5.859,2.303-8.618,0.893C20.139,24.021,20,24.994,20,26
		c0,6.628,5.372,12,12,12s12-5.372,12-12s-5.372-12-12-12c-0.582,0-1.151,0.056-1.709,0.141l-0.008-0.044
		c-0.092,0.013-0.187,0.029-0.283,0.029c-1.105,0-2-0.896-2-2c0-1.105,0.895-2,2-2c0.029,0,0.056,0.007,0.085,0.007
		C30.713,10.056,31.351,10,32,10c8.836,0,16,7.164,16,16S40.836,42,32,42L32,42z"/>
</g> */}

const MarkerIcon = () => {
  return (
    <svg
      height={24}
      viewBox="0 0 24 24"
      style={pinStyle}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* <animateTransform
        attributeType="xml"
        attributeName="transform"
        type="scale"
        to={26}
        restart="always"
        dur="0.7s"
        begin="mouseover"
        repeatCount="1"
      /> */}
      <path d={ICON} />
    </svg>
  );
};
export default MarkerIcon;

// <svg
// id="Layer_1"
// className="enable-background:new 0 0 64 64;"
// version="1.1"
// viewBox="0 0 64 64"
// xmlSpace="preserve"
// xmlns="http://www.w3.org/2000/svg"
// xmlnsXlink="http://www.w3.org/1999/xlink"
// fill="currentColor"
// >
// <g>
//   <g transform="translate(232.000000, 376.000000)">
//     <path d="M-200-320.3l-0.9-1.1c-0.6-0.8-15.9-18.7-15.9-29.4c0-9.3,7.6-16.8,16.8-16.8     s16.8,7.6,16.8,16.8c0,10.7-15.3,28.7-15.9,29.4L-200-320.3L-200-320.3z M-200-365.3c-8,0-14.4,6.5-14.4,14.4     c0,8.4,11.1,22.7,14.4,26.8c3.3-4.1,14.4-18.3,14.4-26.8C-185.6-358.8-192-365.3-200-365.3L-200-365.3z" />
//     <path d="M-200-344.4c-3.5,0-6.4-2.9-6.4-6.4s2.9-6.4,6.4-6.4s6.4,2.9,6.4,6.4S-196.5-344.4-200-344.4     L-200-344.4z M-200-354.8c-2.2,0-4,1.8-4,4s1.8,4,4,4c2.2,0,4-1.8,4-4S-197.8-354.8-200-354.8L-200-354.8z" />
//   </g>
// </g>
// </svg>