console.log('Morning 10. Texture Quad');


// Imported WebGLUtils library from the book
// Imported WebGLDebugUtils library from the book
// Imported cuon-utils library from the book

// Basic setup
// Create canvas element and resize listener
	var canvas = document.createElement('canvas');
	var gl;
	function setCanvasSize(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	setCanvasSize();

	function resetCanvas() {
		setCanvasSize();
	}
	window.addEventListener("resize", function(){ resetCanvas(); });
	canvas.style.display = "block";
	document.body.appendChild(canvas);
	

// WebGL begins
var VSHADER_SOURCE = 
	'attribute vec4 a_Position; \n' +

	'attribute vec2 a_TexCoord; \n' +
	'varying vec2 v_TexCoord; \n' +
	'void main() { \n' +
	'	gl_Position = a_Position; \n' +
	 	'v_TexCoord = a_TexCoord; \n' +
	'} \n';

var FSHADER_SOURCE = 
	'#ifdef GL_ES\n' +
	'precision mediump float;\n' +
	'#endif\n' +
	'uniform sampler2D u_Sampler; \n' +
	'varying vec2 v_TexCoord; \n' +
	'void main() { \n' +
	// Paint each fragment based on its own position
	'		gl_FragColor = texture2D(u_Sampler, v_TexCoord); \n' +
	'}\n';

function main() {
	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
	}
	
	
	// Initialize shaders
	if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to initialize shaders');
		return;
	}
	
	// Write the positions of vertices into the vertex shader
	var n = initVertexBuffers(gl); // This returns the length of vertices pased to WebGL environment
	if (n < 0 ) {
		console.log('Failed to set the positions of the vertices');
		return;
	}

	// Specify color to clear canvas and then clear it
	gl.clearColor(0.1, 0.1, 0.1, 1.0);

	// Setting the textures
	if (!initTextures(gl, n)){
		console.log('Failed to initialize textures');
		return;
	}
}

function initVertexBuffers(webglCanvasContext) {
	// Specify the vertices in a "Typed Array" format, in this case an array for floating numbers
	var _verticesTexCoords = new Float32Array([
		-0.5,	0.5,	0.0, 1.0,
		0.5,	0.5,	1.0, 1.0,
		0.5,	-0.5,	1.0, 0.0,
		-0.5,	-0.5,	0.0, 0.0
	]);
	var n_verticesTexCoords = 4; // Amount of vertices considered to pass into vertex shader
	
	
	// Step 1. Create a buffer object
	// it's in charge of saving vertex array data
	var vertexTexCoordBuffer = webglCanvasContext.createBuffer();
	if (!vertexTexCoordBuffer) {
		console.log('Failed to create buffer object');
		return;
	}
	
	// Step 2. Bind buffer to canvas context
	webglCanvasContext.bindBuffer(webglCanvasContext.ARRAY_BUFFER, vertexTexCoordBuffer);
	
	// Step 3. Write data into buffer
	webglCanvasContext.bufferData(webglCanvasContext.ARRAY_BUFFER, _verticesTexCoords, webglCanvasContext.STATIC_DRAW);
	
	
	// Step 3.5 Define attribute var ocation to pass the buffer data
	var a_Position = webglCanvasContext.getAttribLocation(webglCanvasContext.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return;
	}

	// Calculate size of elements in the array to jump positions between each of them
	var FSIZE = _verticesTexCoords.BYTES_PER_ELEMENT;
	
	
	// Step 4. Connect buffer object with attribute variable in webgl context
	webglCanvasContext.vertexAttribPointer(a_Position, 2, webglCanvasContext.FLOAT, false, FSIZE*4, 0);
	
	// Step 5. Enable (Or as I like to say "switch on") the connection between buffer object and attribute var
	webglCanvasContext.enableVertexAttribArray(a_Position);
	
	
	// Repeat steps 3.5, 4 & 5 to get Texture Coordinates and assign them to vertex shader,
	// this way fragment shader will get them too and will do the interpolation for each fragment
	var a_TexCoord = webglCanvasContext.getAttribLocation(webglCanvasContext.program, 'a_TexCoord');
	if (a_TexCoord < 0) {
		console.log('Failed to get the storage location of a_TexCoord');
		return;
	}

	webglCanvasContext.vertexAttribPointer(a_TexCoord, 2, webglCanvasContext.FLOAT, false, FSIZE*4, FSIZE*2);
	webglCanvasContext.enableVertexAttribArray(a_TexCoord);
	
	// Finally, return the length of the vertices assigned
	return n_verticesTexCoords;
}


function initTextures(webglCanvasContext, n_vertices) {
	// Create a texture object
	var texture = webglCanvasContext.createTexture();

	// Get storage location of sampler2D object that will hold the texture
	var u_Sampler = webglCanvasContext.getUniformLocation(webglCanvasContext.program, 'u_Sampler');
	if (!u_Sampler) {
		console.log('Failed to get storage location of u_Sampler');
		return;
	}

	// Create an image object, native JS script
	var image = new Image();
	if (!image) {
		console.log('Failed to create image object');
		return;
	}

	// Tell the browser to load an image
	image.src = 'img/sky.jpg';
	// Event handler to be called after loading the image through an anonymous function
	image.onload = function() {
		loadTexture(webglCanvasContext, n_vertices, texture, u_Sampler, image);
	}


	return true;
}


function loadTexture(webglCanvasContext, n_vertices, textureObj, fragmentTexVar, imageLoaded) {
	// Flip image to match coordinates system between image and <canvas>
	webglCanvasContext.pixelStorei(webglCanvasContext.UNPACK_FLIP_Y_WEBGL, 1);

	// Enable the texture unit 0
	webglCanvasContext.activeTexture(webglCanvasContext.TEXTURE0);
	// Bind texture to a target
	webglCanvasContext.bindTexture(webglCanvasContext.TEXTURE_2D, textureObj);

	// Set texture parameters
	webglCanvasContext.texParameteri(webglCanvasContext.TEXTURE_2D, webglCanvasContext.TEXTURE_MAG_FILTER, webglCanvasContext.LINEAR);
	// Set texture image
	webglCanvasContext.texImage2D(webglCanvasContext.TEXTURE_2D, 0, webglCanvasContext.RGB, webglCanvasContext.RGB, webglCanvasContext.UNSIGNED_BYTE, imageLoaded);

	// Set the texture unit 0 (TEXTURE0) to the sampler (uniform var inside fragment shader)
	webglCanvasContext.uniform1i(fragmentTexVar, 0);


	// Clear canvas
	webglCanvasContext.clear(webglCanvasContext.COLOR_BUFFER_BIT);
	// Draw all the points specified inside vertex shader
	webglCanvasContext.drawArrays(webglCanvasContext.TRIANGLE_FAN, 0, n_vertices);
}




// main();