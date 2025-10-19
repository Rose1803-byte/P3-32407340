const request = require('supertest');
const app = require('../app'); // Importa tu aplicación Express desde app.js (sube un nivel)

describe('Pruebas de la API del Proyecto P3', () => {
    
    // Prueba 1: Verificar el Endpoint /ping
    test('GET /ping should respond with status code 200 (OK)', async () => {
        const response = await request(app).get('/ping');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({}); 
    });

    // Prueba 2: Verificar el Endpoint /about
    test('GET /about should return student data in JSend format', async () => {
        const response = await request(app).get('/about');
        
        // 1. Check HTTP status code
        expect(response.statusCode).toBe(200);
        
        // 2. Check JSend format: status must be 'success'
        expect(response.body.status).toBe('success');
        
        // 3. Check for required data object
        expect(response.body.data).toBeDefined();
        
        // 4. Check for required fields inside 'data'
        expect(response.body.data.nombreCompleto).toBeDefined();
        expect(response.body.data.cedula).toBeDefined();
        expect(response.body.data.seccion).toBeDefined();
    });

    // Prueba 3: Verify 404 (Not Found) for non-existent routes
    test('GET to a non-existent route should return 404 (Not Found)', async () => {
        const response = await request(app).get('/a-non-existent-route');
        expect(response.statusCode).toBe(404);
        
        // Express por defecto devuelve un objeto de error
        expect(response.body.status).toBe('error');
    });
});
