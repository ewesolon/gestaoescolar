// Script para forçar limpeza de cache
(function() {
    console.log('🧹 Iniciando limpeza forçada de cache...');
    
    // 1. Limpar localStorage
    try {
        localStorage.clear();
        console.log('✅ localStorage limpo');
    } catch (e) {
        console.error('❌ Erro ao limpar localStorage:', e);
    }
    
    // 2. Limpar sessionStorage
    try {
        sessionStorage.clear();
        console.log('✅ sessionStorage limpo');
    } catch (e) {
        console.error('❌ Erro ao limpar sessionStorage:', e);
    }
    
    // 3. Limpar cache do navegador
    if ('caches' in window) {
        caches.keys().then(function(names) {
            return Promise.all(
                names.map(function(name) {
                    console.log('🗑️ Removendo cache:', name);
                    return caches.delete(name);
                })
            );
        }).then(function() {
            console.log('✅ Cache do navegador limpo');
        }).catch(function(e) {
            console.error('❌ Erro ao limpar cache:', e);
        });
    }
    
    // 4. Remover service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            registrations.forEach(function(registration) {
                console.log('🗑️ Removendo service worker:', registration.scope);
                registration.unregister();
            });
        });
    }
    
    // 5. Forçar recarregamento sem cache
    setTimeout(function() {
        console.log('🔄 Recarregando página sem cache...');
        window.location.reload(true);
    }, 2000);
})();