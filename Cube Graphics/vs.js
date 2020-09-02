var myVertexShader = `
	attribute vec4 vPosition;
	attribute vec4 vColor;
	varying vec4 color;

	uniform mat4 M_comp;
	uniform vec4 v_cameraPos;
	uniform mat4 m_cameraTrans;

	void main() {
		
		gl_Position = ((M_comp*vPosition)*m_cameraTrans)+v_cameraPos;
		color = vColor;
	}
`;