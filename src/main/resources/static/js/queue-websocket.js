let stompClient = null;

function connectWebSocket(doctorId, onUpdateCallback) {
    const socket = new SockJS('/ws-queue');
    stompClient = Stomp.over(socket);
    stompClient.debug = null; // Suppress debug console logs

    stompClient.connect({}, function (frame) {
        console.log('Connected to Hospital Queue WebSocket');
        
        const topic = doctorId ? `/topic/queue/${doctorId}` : '/topic/queue/all';
        stompClient.subscribe(topic, function (message) {
            const queueData = JSON.parse(message.body);
            if (onUpdateCallback) {
                onUpdateCallback(queueData);
            }
        });
    }, function (error) {
        console.error('WebSocket Error:', error);
        // Automatic reconnection retry after 4 seconds
        setTimeout(() => connectWebSocket(doctorId, onUpdateCallback), 4000);
    });
}
