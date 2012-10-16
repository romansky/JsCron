{exec} = require 'child_process'

handleExecErrors = (err, stdout, stderr)->
        console.log err if err
        console.log 'Messages: ' + stdout + stderr if err || stdout

task 'build',->
	exec "coffee -c index", handleExecErrors

task 'test',->
	exec "node_modules/jasmine-node/bin/jasmine-node --verbose --color --coffee ./specs" , handleExecErrors
