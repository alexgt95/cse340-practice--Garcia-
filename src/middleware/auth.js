// Route guard: lets the request through only if someone is logged in
const requireLogin = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

export { requireLogin };
