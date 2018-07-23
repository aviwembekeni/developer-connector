const express = require("express");
const router = express.Router();

// @route           GET api/users/tests
// @description     Tests users route
// @access          Public

router.get("/test", (req, res) => res.json({ msg: "users works" }));

module.exports = router;
