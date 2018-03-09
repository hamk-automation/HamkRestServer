const async = require('async')

module.exports = function(app) {

    var User = app.models.user
    var Role = app.models.Role
    var RoleMapping = app.models.RoleMapping

    app.dataSources.mysqlDs.autoupdate('RoleMapping', function(err) {
        if (err) console.log(err)
    })

    app.dataSources.mysqlDs.autoupdate('AccessToken', function(err) {
        if (err) console.log(err)
    })

    app.dataSources.mysqlDs.autoupdate('Role', function(err) {
        if (err) throw err

        function createRole(nameVal, callback) {
            Role.findOrCreate(
                { where: { name: nameVal } },
                {
                    name: nameVal,
                    description: nameVal
                },
                function(err, role) {
                    if (err) throw err
                    callback()
                }
            )
        }

        // Create roles
        async.eachSeries(
            ["admin", "staff", "device", "guest"],
            createRole,
            function(err, roles) {
                if (err) throw err
            }
        )
    })

    app.dataSources.mysqlDs.autoupdate('sensor', function(err) {
        if (err) console.log(err)
    })

    app.dataSources.mysqlDs.autoupdate('location', function(err) {
        if (err) console.log(err)
    })

    app.dataSources.mysqlDs.autoupdate('system', function(err) {
        if (err) console.log(err)
    })

    app.dataSources.mysqlDs.autoupdate('building', function(err) {
        if (err) console.log(err)
    })

    app.dataSources.mysqlDs.autoupdate('user', function(err) {
        if (err) throw err

        var context = {}

        function createDefaultAdmin(context, cb) {
            User.findOrCreate(
                { where: { email: 'minh.tran@hamk.fi' } },
                {
                    email: 'minh.tran@hamk.fi',
                    password: 'minmax',
                    realm: '',
                    username: 'admin0',
                    emailVerified: true,
                    role: 'admin'
                },
                function(err, user) {
                    if (err) {
                        cb(err)
                        return
                    }
                    context.user = user
                    cb()
                }
            )
        }

        function findAdminRole(context, cb) {
            Role.findOrCreate(
                { where: { name: 'admin' } },
                {
                    name: 'admin',
                    description: 'admin'
                },
                function(err, role) {
                    if (err) {
                        cb(err)
                        return
                    }
                    context.role = role
                    cb()
                }
            )
        }

        function createRoleMapping(context, cb) {
            RoleMapping.findOne(
                { where: { principalId: context.user.id } },
                function(err, roleMapping) {
                    if (err) {
                        cb(err)
                        return
                    }
                    if (roleMapping == null) {
                        // Make minh.tran@hamk.fi an admin
                        context.role.principals.create({
                            principalType: RoleMapping.USER,
                            principalId: context.user.id
                        }, function(err, principal) {
                            console.log(principal)
                            cb(err)
                        })
                    } else {
                        console.log("Found default role mapping row")
                        cb()
                    }
                }
            )
        }

        async.applyEachSeries(
            [createDefaultAdmin, findAdminRole, createRoleMapping],
            context,
            function(err) {
                if (err) console.log(err)
            }
        )
    })
}
