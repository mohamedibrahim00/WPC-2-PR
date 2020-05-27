var wpbfp = '${settings.wp_protect}' == 'true' ? "THROTTLE" : "OFF";

var resp = {
  result: 0,
  ssl: !!jelastic.billing.account.GetQuotas('environment.jelasticssl.enabled').array[0].value,
  nodes: [{
    nodeType: "storage",
    flexibleCloudlets: ${settings.st_flexibleCloudlets:16},
    fixedCloudlets: ${settings.st_fixedCloudlets:8},
    diskLimit: ${settings.st_diskLimit:150},
    nodeGroup: "storage",
    displayName: "Storage"
  }]
}

if (${settings.galera:false}) {
  resp.nodes.push({
    nodeType: "mariadb-dockerized",
    tag: "10.3.20",
    count: 3,
    flexibleCloudlets: ${settings.db_flexibleCloudlets:64},
    fixedCloudlets: ${settings.db_fixedCloudlets:32},
    diskLimit: ${settings.db_diskLimit:25},
    nodeGroup: "sqldb",
    displayName: "Galera cluster",
    restartDelay: 5,
    skipNodeEmails: true,
    env: {
      ON_ENV_INSTALL: "",
      JELASTIC_PORTS: "4567,4568,4444"
    }
  })
}

if (!${settings.galera:false}) {
  resp.nodes.push({
    nodeType: "mariadb-dockerized",
    tag: "10.3.20",
    count: 3,
    flexibleCloudlets: ${settings.db_flexibleCloudlets:64},
    fixedCloudlets: ${settings.db_fixedCloudlets:32},
    diskLimit: ${settings.db_diskLimit:25},
    nodeGroup: "sqldb",
    displayName: "Galera cluster",
    restartDelay: 5,
    skipNodeEmails: true,
    env: {
      ON_ENV_INSTALL: "",
      JELASTIC_PORTS: "4567,4568,4444"
 } 
  })
}

if (${settings.ls-addon:false}) {
  resp.nodes.push({
    nodeType: "litespeedadc",
    tag: "2.5.1",
    count: 1,
    flexibleCloudlets: ${settings.bl_flexibleCloudlets:16},
    fixedCloudlets: ${settings.bl_fixedCloudlets:8},
    diskLimit: ${settings.bl_diskLimit:5},
    nodeGroup: "bl",
    scalingMode: "STATEFUL",
    displayName: "Load balancer",
    env: {
      WP_PROTECT: wpbfp,
      WP_PROTECT_LIMIT: 100
    }
  }, {
    nodeType: "litespeedphp",
    tag: "5.4.1-php-7.3.7",
    count: ${settings.cp_count:2},
    flexibleCloudlets: ${settings.cp_flexibleCloudlets:128},
    fixedCloudlets: ${settings.cp_fixedCloudlets:64},
    diskLimit: ${settings.cp_diskLimit:20},
    nodeGroup: "cp",
    scalingMode: "STATELESS",
    displayName: "AppServer",
    env: {
      SERVER_WEBROOT: "/var/www/webroot/ROOT",
      REDIS_ENABLED: "true",
      WAF: "${settings.waf:false}",
      WP_PROTECT: "OFF"
    },
    volumes: [
      "/var/www/webroot/ROOT"
    ],  
    volumeMounts: {
      "/var/www/webroot/ROOT": {
        readOnly: "false",
        sourcePath: "/data/ROOT",
        sourceNodeGroup: "storage"
      }
    }
  })
}

if (!${settings.ls-addon:false}) {
  resp.nodes.push({
    nodeType: "nginx-dockerized",
    tag: "1.16.0",
    count: 1,
    flexibleCloudlets: ${settings.bl_flexibleCloudlets:16},
    fixedCloudlets: ${settings.bl_fixedCloudlets:8},
    diskLimit: ${settings.bl_diskLimit:5},
    nodeGroup: "bl",
    scalingMode: "STATEFUL",
    displayName: "Load balancer"
  }, {
    nodeType: "nginxphp-dockerized",
    tag: "1.16.0-php-7.3.8",
    count: ${settings.cp_count:2},
    flexibleCloudlets: ${settings.cp_flexibleCloudlets:128},                  
    fixedCloudlets: ${settings.cp_fixedCloudlets:64},
    diskLimit: ${settings.cp_diskLimit:20},
    nodeGroup: "cp",
    scalingMode: "STATELESS",
    displayName: "AppServer",
    env: {
      SERVER_WEBROOT: "/var/www/webroot/ROOT",
      REDIS_ENABLED: "true"
    },
    volumes: [
      "/var/www/webroot/ROOT",
      "/var/www/webroot/.cache",
      "/etc/nginx/conf.d/SITES_ENABLED"
    ],  
    volumeMounts: {
      "/var/www/webroot/ROOT": {
        readOnly: "false",
        sourcePath: "/data/ROOT",
        sourceNodeGroup: "storage"
      },
      "/var/www/webroot/.cache": {
        readOnly: "false",
        sourcePath: "/data/.cache",
        sourceNodeGroup: "storage"
      },
      "/etc/nginx/conf.d/SITES_ENABLED": {
        readOnly: "false",
        sourcePath: "/data/APP_CONFIGS",
        sourceNodeGroup: "storage"
      }
    }
  })
}

return resp;
