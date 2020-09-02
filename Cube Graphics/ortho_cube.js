var canvas;
var gl;

var program;
var vertexShader, fragmentShader;
var compiled;
var selection = 1;

var NumCubeVertices = 36;
var tri_verts  = [];
var tri_colors = [];

var vColor, vPosition;

var M_Loc;

var camera = {"x":0,"y":0,"z":0,"xRadian":0,"yRadian":90,"zRadian":0};
var perspective = {"width":0,"height":0,"near":0,"far":0};

var v_cameraPos;
var m_cameraTrans;

// all initializations
window.onload = function init() {
    // get canvas handle
    canvas = document.getElementById( "gl-canvas" );

    // WebGL Initialization
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true} );
    if ( !gl ) {
        alert( "WebGL isn't available" );
    }
    gl.viewport( 0, 0, canvas.width/2, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.0, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );

    // create shaders, compile and link program
    program = createShaders();
    gl.useProgram(program);

    // create the colored cube
    createColorCube();

    // buffers to hold cube vertices and its colors
    vBuffer = gl.createBuffer();
    cBuffer = gl.createBuffer();

    // allocate space for points
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tri_verts), gl.STATIC_DRAW);

    // variables through which shader receives vertex and other attributes
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(tri_colors), gl.STATIC_DRAW );

    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vColor );


    M_Loc = gl.getUniformLocation(program, "M_comp");
    v_cameraPos = gl.getUniformLocation(program, "v_cameraPos");
    m_cameraTrans = gl.getUniformLocation(program, "m_cameraTrans");

    gl.enable(gl.DEPTH_TEST);


    render();
};

// all drawing is performed here
function render(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



    ////////////////////////////
    ///Start of first view port within first half of glcanvas

    gl.viewport( 0, 0, canvas.width/2, canvas.height );

    //Declare views need for camera transform from HTML
    perspective.width = document.getElementById('windowWidth').value * .1;
    perspective.height = document.getElementById('windowHeight').value * .1;
    perspective.near = document.getElementById('windowNear').value * .1;
    perspective.far = document.getElementById('windowFar').value * 1;

    //create perspectivce view
    var perspectiveVec = [perspective.width, perspective.height, perspective.near, perspective.far];

    //start rotation of second cube
    rotate = true;
    if (rotate = "true")
    {
        if (camera.yRadian < 360)
        {
            camera.yRadian++;
        }
        else
        {
            camera.yRadian = 0;
        }
    }

    camera.zRadian = 45;





    //declare render instance of cube
    var M_cube;
    x = identity4();
    gl.uniformMatrix4fv(m_cameraTrans, false, flatten(x));

    //Main Cube Rendered
    M_cube = scale4x4(3, 3, 3);

    gl.uniformMatrix4fv(M_Loc, false, flatten(transpose4x4(M_cube)));
    gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );

    //Cube Atop Main for perspective
    M_cube = matMult4(scale4x4(1.5, 1.5, 1.5), transl4x4(0, 0.70, 0));

    gl.uniformMatrix4fv(M_Loc, false, flatten(transpose4x4(M_cube)));
    gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );

    ////////////////////////////
    ///End of first view port within first half of glcanvas

    ////////////////////////////
    ///Start of second view port within other half of glcanvas

    gl.viewport( canvas.width/4, 0,  canvas.width, canvas.height );

    //This allows the user to see the difference between the cube perspectives.
   // if (document.getElementById('viewToggle').value == "false")
    //{
    var M_rot = matMult4(rotation4x4(camera.yRadian, "y"), rotation4x4(camera.zRadian, "z"));

    M_rot = matMult4(perspectiveMat(perspectiveVec), M_rot);
    //}

    gl.uniformMatrix4fv(m_cameraTrans, false, flatten(M_rot));


    var v_camera = matVecMult4([[-1,0,0,0],[0,-1,0,0],[0,0,-1,0],[0,0,0,1]], [camera.x, camera.y, camera.z, 3]);

    //render both views
    gl.uniform4fv(v_cameraPos, v_camera);


    //declare render instance of cube
    var M_cube;

    //Main Cube Rendered
    M_cube = scale4x4(3, 3, 3);

    gl.uniformMatrix4fv(M_Loc, false, flatten(transpose4x4(M_cube)));
    gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );

    //Cube Atop Main for perspective
    M_cube = matMult4(scale4x4(1.5, 1.5, 1.5), transl4x4(0, 0.70, 0));

    gl.uniformMatrix4fv(M_Loc, false, flatten(transpose4x4(M_cube)));
    gl.drawArrays(gl.TRIANGLES, 0, NumCubeVertices );

    ////////////////////////////
    ///End of second view port within second half of glcanvas

    requestAnimFrame( render );
}

// create a colored cube with 8 vertices and colors at
// at each vertex
function createColorCube () {
    createQuad( 1, 0, 3, 2 );
    createQuad( 2, 3, 7, 6 );
    createQuad( 3, 0, 4, 7 );
    createQuad( 6, 5, 1, 2 );
    createQuad( 4, 5, 6, 7 );
    createQuad( 5, 4, 0, 1 );
}

function createQuad (a, b, c, d) {
    var vertices  = getCubeVertices();
    var vertex_colors  = getCubeVertexColors();

    // Each quad is rendered as two triangles as WebGL cannot
    // directly render a quad

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        verts.push(vertices[indices[i]]);
        vert_colors.push(vertex_colors[indices[i]]);
    }
}

function getCubeVertices() {
    return [
        [ -0.25, -0.25,  0.25 ],
        [ -0.25,  0.25,  0.25 ],
        [  0.25,  0.25,  0.25 ],
        [  0.25, -0.25,  0.25 ],
        [ -0.25, -0.25,  -0.25 ],
        [ -0.25,  0.25,  -0.25 ],
        [  0.25,  0.25,  -0.25 ],
        [  0.25, -0.25,  -0.25 ]
    ];
}
function getCubeVertexColors() {
    return [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 1.0, 1.0, 1.0, 1.0 ],  // white
        [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
    ];
}

function createQuad (a, b, c, d) {
    var vertices  = getCubeVertices();
    var vertex_colors  = getCubeVertexColors();

    // Each quad is rendered as two triangles as WebGL cannot
    // directly render a quad

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        tri_verts.push(vertices[indices[i]]);
        tri_colors.push(vertex_colors[indices[i]]);
    }
}


// function that does all shader initializations and 
// returns the compiled shader program
function createShaders () {
    // Create program object
    program = gl.createProgram();

    //  Load vertex shader
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, myVertexShader);
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);
    compiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    if (!compiled) {
        console.error(gl.getShaderInfoLog(vertexShader));
    }

    //  Load fragment shader
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, myFragmentShader);
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);
    compiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!compiled) {
        console.error(gl.getShaderInfoLog(fragmentShader));
    }

    //  Link program
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        console.error(gl.getProgramInfoLog(program));
    }
    return program;
}

function identity4() {
    var m = [];
    m = [
        [1.0, 0.0, 0.0, 0.0],
        [0.0, 1.0, 0.0, 0.0],
        [0.0, 0.0, 1.0, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ];

    return m;
}
function transpose4x4(m) {
    var result = [];

    result.push ([m[0][0], m[1][0], m[2][0], m[3][0]]);
    result.push ([m[0][1], m[1][1], m[2][1], m[3][1]]);
    result.push ([m[0][2], m[1][2], m[2][2], m[3][2]]);
    result.push ([m[0][3], m[1][3], m[2][3], m[3][3]]);

    return result;
}
