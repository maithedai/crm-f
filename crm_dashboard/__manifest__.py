# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': 'CRM Dashboard',
    'version': '15.0',
    'sequence': 1,
    'summary': 'CRM Dashboard',
    'description': '''
        CRM Dashboard.
    ''',

    'depends': ['hr'],

    'installable': True,
    'application': True,
    'auto_install': False,

    'data': [
        'security/ir.model.access.csv',
        'menus/dashboard_menu.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'crm_dashboard/static/src/lib/js/chart.min.js',
            'crm_dashboard/static/src/lib/js/apexcharts.min.js',
            'crm_dashboard/static/src/lib/js/highcharts.js',
            'crm_dashboard/static/src/lib/js/highcharts-more.js',
            'crm_dashboard/static/src/lib/js/maps.js',
            'crm_dashboard/static/src/lib/js/solid-gauge.js',
            'crm_dashboard/static/src/lib/js/canvasjs.min.js',
            'crm_dashboard/static/src/lib/js/funnel.js',
            'crm_dashboard/static/src/lib/css/Chart.min.css',
            'crm_dashboard/static/src/css/report_viewer.scss',
            'crm_dashboard/static/src/css/chart_common.scss',
            'crm_dashboard/static/src/css/dashboard_scss.scss',
            'crm_dashboard/static/src/js/dashboard_header.js',
            'crm_dashboard/static/src/js/bc_trading.js',
        ],
        'web.assets_qweb': [
            'crm_dashboard/static/src/xml/dashboard_header_view.xml',
            'crm_dashboard/static/src/xml/bc_trading_view.xml',
        ],
    },
}
