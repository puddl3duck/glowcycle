// Script para limpiar datos de prueba
// Ejecuta esto en la consola del navegador: clearAllTestData()

function clearAllTestData() {
    console.log('🧹 Limpiando datos de prueba...');
    
    // Limpiar datos de usuario de prueba
    localStorage.removeItem('userName');
    localStorage.removeItem('userAge');
    localStorage.removeItem('lastPeriod');
    localStorage.removeItem('cycleLength');
    localStorage.removeItem('skinType');
    
    // Limpiar datos de wellness
    localStorage.removeItem('lastJournalTime');
    localStorage.removeItem('lastSkinScanTime');
    localStorage.removeItem('lastCycleUpdateTime');
    localStorage.removeItem('cachedWellnessMessage');
    localStorage.removeItem('wellnessMessageHash');
    
    // Limpiar cualquier otro dato de prueba
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('test') || key.includes('Test') || key.includes('TEST'))) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => {
        console.log(`  Eliminando: ${key}`);
        localStorage.removeItem(key);
    });
    
    console.log('✅ Datos de prueba eliminados');
    console.log('🔄 Recargando página...');
    
    setTimeout(() => {
        location.reload();
    }, 500);
}

// Auto-ejecutar si se detecta "TestUser"
if (localStorage.getItem('userName') === 'TestUser') {
    console.warn('⚠️ Detectado usuario de prueba "TestUser"');
    console.log('💡 Ejecuta clearAllTestData() para limpiar');
}
