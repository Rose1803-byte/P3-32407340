const request = require('supertest');
const app = require("../src/app");
describe('Pruebas de la API del Proyecto P3'), () => {
    

    test('GET /ping should respond with status code 200 (OK)', async () => {
        const response = await request(app).get('/ping');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({}); 
    });

    
    test('GET /about should return student data in JSend format', async () => {
        const response = await request(app).get('/about');
        
        

    test('GET /about should return student data in JSend format', async () => {
        const response = await request(app).get('/about');
        
    
        expect(response.statusCode).toBe(200);
        

        expect(response.body.status).toBe('success');
        
       
        expect(response.body.data).toBeDefined();
        
        
        expect(response.body.data.nombrecompleto).toBeDefined();

        expect(response.body.data).toBeDefined();
        

        expect(response.body.data.nombreCompleto).toBeDefined();
        expect(response.body.data.cedula).toBeDefined();
        expect(response.body.data.seccion).toBeDefined();
    });

    
    test('GET to a non-existent route should return 404 (Not Found)', async () => {
        const response = await request(app).get('/a-non-existent-route');
        expect(response.statusCode).toBe(404);
        
       
        expect(response.body.status).toBe('error');
    });
});
}
