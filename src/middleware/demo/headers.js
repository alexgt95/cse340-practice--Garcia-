const addDemoHeaders = (req, res, next) => {
    res.setHeader('X-Demo-Page', 'true');
    res.setHeader('X-Middleware-Demo', 'Este mensaje viene del middleware');
    next();
};

export { addDemoHeaders };
