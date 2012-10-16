{exec} = require 'child_process'

handleExecErrors = (err, stdout, stderr)->
        if err then console.log 'Errors: '+err
        if stdout then console.log 'Messages: '+stdout
        if stderr then console.log 'Errors: '+stderr
        if err then process.exit 1


task 'build',->
	exec "coffee -c index", handleExecErrors

task 'test',->
	exec "node_modules/jasmine-node/bin/jasmine-node --verbose --color --coffee ./specs" , handleExecErrors
