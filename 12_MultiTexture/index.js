console.log('Morning 12. MultiTexture');


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
	'uniform sampler2D u_Sampler0; \n' +
	'uniform sampler2D u_Sampler1; \n' +

	'varying vec2 v_TexCoord; \n' +
	'void main() { \n' +
	// Get fragment color based on its position matching with the image
	'	vec4 color0 = texture2D(u_Sampler0, v_TexCoord); \n' +
	'	vec4 color1 = texture2D(u_Sampler1, v_TexCoord); \n' +
	'	gl_FragColor = color0 / color1; \n' +
	// '	gl_FragColor = color0 * color1; \n' + // Multiply blend mode
	// '	gl_FragColor = color1 + color0; \n' + // Add blend mode
	// '	gl_FragColor = (color0 + color1) - (color0 * color1); \n' + // Screen blend mode
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
	var texture0 = webglCanvasContext.createTexture();
	var texture1 = webglCanvasContext.createTexture();

	// Get storage location of sampler2D objects that will hold the textures
	var u_Sampler0 = webglCanvasContext.getUniformLocation(webglCanvasContext.program, 'u_Sampler0');
	var u_Sampler1 = webglCanvasContext.getUniformLocation(webglCanvasContext.program, 'u_Sampler1');
	if (!u_Sampler0) {
		console.log('Failed to get storage location of u_Sampler0');
		return;
	}
	if (!u_Sampler1) {
		console.log('Failed to get storage location of u_Sampler1');
		return;
	}

	// Create the image objects to load textures, native JS script
	var image0 = new Image();
	var image1 = new Image();
	if (!image0) {
		console.log('Failed to create image object');
		return;
	}

	if (!image1) {
		console.log('Failed to create image object');
		return;
	}

	// Tell the browser to load an image
	image0.src = '../img/texture_1024.jpg';
	image1.src = '../img/circle.gif';



	// Event handler to be called after loading the image through an anonymous function
	image0.onload = function() {
		loadTexture(webglCanvasContext, n_vertices, texture0, u_Sampler0, image0, 0);
	}
	image1.onload = function() {
		loadTexture(webglCanvasContext, n_vertices, texture1, u_Sampler1, image1, 1);
	}


	return true;
}


var g_texUnit0, g_texUnit1 = false;
function loadTexture(webglCanvasContext, n_vertices, textureObj, fragmentTexVar, imageLoaded, texUnit) {
	// Flip image to match coordinates system between image and <canvas>
	webglCanvasContext.pixelStorei(webglCanvasContext.UNPACK_FLIP_Y_WEBGL, 1);

	// Detect which texture unit is being loaded now and enable the correct one
	if (texUnit == 0) {
		webglCanvasContext.activeTexture(webglCanvasContext.TEXTURE0);
		g_texUnit0 = true;
	} else {
		webglCanvasContext.activeTexture(webglCanvasContext.TEXTURE1);
		g_texUnit1 = true;
	}
	
	// Bind texture to a target
	webglCanvasContext.bindTexture(webglCanvasContext.TEXTURE_2D, textureObj);

	

	// Set texture parameters
	webglCanvasContext.texParameteri(webglCanvasContext.TEXTURE_2D, webglCanvasContext.TEXTURE_MIN_FILTER, webglCanvasContext.LINEAR);
	webglCanvasContext.texParameteri(webglCanvasContext.TEXTURE_2D, webglCanvasContext.TEXTURE_WRAP_T, webglCanvasContext.CLAMP_TO_EDGE);
	webglCanvasContext.texParameteri(webglCanvasContext.TEXTURE_2D, webglCanvasContext.TEXTURE_WRAP_S, webglCanvasContext.CLAMP_TO_EDGE);
	// Set texture image
	webglCanvasContext.texImage2D(webglCanvasContext.TEXTURE_2D, 0, webglCanvasContext.RGBA, webglCanvasContext.RGBA, webglCanvasContext.UNSIGNED_BYTE, imageLoaded);

	// Pass the texture unit to the sampler (uniform var inside fragment shader)
	webglCanvasContext.uniform1i(fragmentTexVar, texUnit);

	// Clear canvas
	webglCanvasContext.clear(webglCanvasContext.COLOR_BUFFER_BIT);

	if (g_texUnit0 && g_texUnit1){
		// Draw all the points specified inside vertex shader
		webglCanvasContext.drawArrays(webglCanvasContext.TRIANGLE_FAN, 0, n_vertices);
	}
}




// main();