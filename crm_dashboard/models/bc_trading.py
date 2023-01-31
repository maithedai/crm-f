from odoo import models, fields, api, _


class BCTrading(models.AbstractModel):
    _name = 'bc.trading'
    _inherit = 'report.header'

    filter_branch = True
    filter_branches = False
    filter_date = {'mode': 'range', 'filter': 'this_month'}
    filter_location = True
    filter_product_category = True
    filter_product = False
    filter_source = False
    filter_career = False
    filter_reason_fail = False

    @api.model
    def get_detail_data(self, data_option):
        print(data_option)
