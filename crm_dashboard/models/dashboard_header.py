# -*- coding: utf-8 -*-

import csv
import datetime
import logging
import os
import tempfile
import calendar

from babel.dates import get_quarter_names
from dateutil.relativedelta import relativedelta

from odoo import models, fields, api, _
from odoo.tools import date_utils, get_lang
from odoo.tools.misc import formatLang, format_date


class ReportHeader(models.AbstractModel):
    _name = 'report.header'
    _description = 'Report Header'

    # MAX_LINES = 1000
    filter_multi_company = None
    # filter_date = None
    # filter_all_entries = None
    filter_comparison = None
    # filter_journals = None
    # filter_analytic = None
    # filter_unfold_all = None
    # filter_hierarchy = None
    # filter_partner = None
    # filter_account = None
    # filter_branch = None
    # filter_account_book = None
    # filter_currency = None
    # order_selected_column = None
    # filter_state_move = None
    # filter_options = None
    # filter_account_tax_category = None
    # # filter_date = {'mode': 'range', 'filter': 'this_month'}
    # filter_comparison = {'filter': 'no_comparison', 'number_period': 1}

    filter_date = {'mode': 'range', 'filter': 'this_month'}
    filter_all_entries = None
    filter_journals = None
    filter_branch = None
    filter_branches = None
    filter_account_book = None
    filter_analytic = None
    filter_unfold_all = None
    filter_cash_basis = None
    filter_hierarchy = None
    filter_account = None
    filter_options = None
    filter_product = None
    filter_department = None
    filter_campaign = None
    filter_location = None
    filter_cost_object = None
    filter_asset = None
    filter_product_category = None
    filter_partner_category = None
    filter_cost_type = None
    filter_construction = None
    filter_reason_fail = False
    filter_state_m2m = None
    filter_size_company = None
    filter_source = None
    filter_res_users = False
    filter_user = None
    filter_career = None
    filter_product_group = None
    filter_state = None
    filter_top_selling = None
    filter_selling_step = None
    filter_export_excel = True

    @api.model
    def _init_filter_export_excel(self, options, previous_options=None):
        if not self.filter_export_excel:
            return
        options['export_excel'] = True

    @api.model
    def _init_filter_top_selling(self, options, previous_options=None):
        if not self.filter_top_selling:
            return

        options['top_selling'] = True
        options['top_selling_ids'] = previous_options and previous_options.get(
            'top_selling_ids') or []
        selected_top_selling_ids = [int(top_selling) for top_selling in options['top_selling_ids']]
        selected_top_selling = selected_top_selling_ids and self.env['product.template'].browse(
            selected_top_selling_ids) or self.env['product.template'].search([])
        options['selected_top_selling_ids'] = selected_top_selling.mapped('name')

    @api.model
    def _init_filter_cus_type(self, options, previous_options=None):
        if not self.filter_cus_type:
            return

        options['cus_type'] = True
        options['cus_type_ids'] = previous_options and previous_options.get(
            'cus_type_ids') or []
        selected_cus_type_ids = [int(cus_type) for cus_type in options['cus_type_ids']]
        selected_cus_type = selected_cus_type_ids and self.env['vt.param'].browse(
            selected_cus_type_ids) or self.env['vt.param'].search([])
        options['selected_cus_type_ids'] = selected_cus_type.mapped('title')

    @api.model
    def _init_filter_product(self, options, previous_options=None):
        if not self.filter_product:
            return

        options['product'] = True
        options['product_ids'] = previous_options and previous_options.get(
            'product_ids') or []
        # options['product_categories'] = previous_options and previous_options.get(
        #     'product_categories') or []
        selected_product_ids = [int(product) for product in options['product_ids']]
        selected_products = selected_product_ids and self.env['product.product'].browse(
            selected_product_ids) or self.env['product.product']
        options['selected_product_ids'] = selected_products.mapped('name')
        # selected_product_category_ids = [
        #     int(category) for category in options['product.category']]
        # selected_product_categories = selected_product_category_ids and self.env['product.category'].browse(
        #     selected_product_category_ids) or self.env['product.category']
        # options['selected_product_categories'] = selected_product_categories.mapped(
        #     'name')

    @api.model
    def _init_filter_source(self, options, previous_options=None):
        if not self.filter_source:
            return

        options['source'] = True
        options['source_ids'] = previous_options and previous_options.get(
            'source_ids') or []
        selected_source_ids = [int(source) for source in options['source_ids']]
        selected_sources = selected_source_ids and self.env['vt.param'].browse(
            selected_source_ids) or self.env['vt.param']
        options['selected_source_ids'] = selected_sources.mapped('title')

    @api.model
    def _init_filter_res_users(self, options, previous_options=None):
        if not self.filter_res_users:
            return
        branches = previous_options.get('branches') or previous_options.get('branch', [])
        selected_branches = [branch['id'] for branch in branches if isinstance(branch['id'], int) and branch['selected']] if isinstance(branches, list) else [branches]
        selected_departments = previous_options.get('department_ids')
        domain = selected_departments or selected_branches
        options['res_user'] = True
        options['selected_res_users'] = previous_options and previous_options.get('selected_res_users', [])

    # @api.model
    # def _init_filter_user(self, options, previous_options=None):
    #     if not self.filter_user:
    #         return
    #     branches = previous_options.get('branches') or previous_options.get('branch', [])
    #     selected_branches = [branch['id'] for branch in branches if
    #                          isinstance(branch['id'], int) and branch['selected']] if isinstance(branches, list) else [branches]
    #     options['user'] = True
    #     options['user_ids'] = self.get_domain_users(selected_branches)
    #     options['selected_users'] = previous_options and previous_options.get('selected_users', [])

    @api.model
    def _init_filter_career(self, options, previous_options=None):
        if not self.filter_career:
            return

        options['career'] = True
        options['career_ids'] = previous_options and previous_options.get(
            'career_ids') or []
        selected_career_ids = [int(career) for career in options['career_ids']]
        selected_careers = selected_career_ids and self.env['vt.param'].browse(
            selected_career_ids) or self.env['vt.param']
        options['selected_career_ids'] = selected_careers.mapped('title')

    @api.model
    def _init_filter_department(self, options, previous_options=None):
        if not self.filter_department:
            return

        options['department'] = True
        options['department_ids'] = previous_options and previous_options.get(
            'department_ids') or []
        selected_department_ids = [int(department) for department in options['department_ids']]
        selected_department = selected_department_ids and self.env['hr.department'].browse(
            selected_department_ids) or self.env['hr.department']
        options['selected_department_ids'] = (self.env.user.employee_id.vt_subordinate_ids | self.env.user.employee_id).department_id.ids

    @api.model
    def _init_filter_state(self, options, previous_options=None):
        if not self.filter_state:
            return
        options['state'] = True
        options['state_ids'] = previous_options and previous_options.get(
            'state_ids') or []
        if len(options['state_ids']) > 1:
            for item in options['state_ids']:
                selected_state_ids = [int(item)]
                break
        else:
            selected_state_ids = [int(item) for item in options['state_ids']]
        selected_state = selected_state_ids and self.env['res.country.state'].browse(
            selected_state_ids) or self.env['res.country.state']
        options['selected_state_ids'] = selected_state.mapped('name')

    @api.model
    def _init_filter_state_m2m(self, options, previous_options=None):
        if not self.filter_state_m2m:
            return
        options['state_m2m'] = True
        options['state_m2m_ids'] = previous_options and previous_options.get(
            'state_m2m_ids') or []
        selected_state_ids = [int(item) for item in options['state_m2m_ids']]
        selected_state = selected_state_ids and self.env['res.country.state'].browse(
            selected_state_ids) or self.env['res.country.state']
        options['selected_state_m2m_ids'] = selected_state.mapped('name')

    # @api.model
    # def _get_options_branches(self, options):
    #     selected_branch = self.env.context.get('selected_branch')
    #     if self.env.user.selected_branch_ids.ids and len(self.env.user.selected_branch_ids.ids) == 1:
    #         if len(options.get('branches', [])) > 1:
    #             options.get('branches', [])[1]['selected'] = True
    #     elif len(self.env.user.selected_branch_ids) > 1 and selected_branch:
    #         for branch in options.get('branches', []):
    #             if branch['id'] == int(selected_branch):
    #                 branch['selected'] = True
    #     return [
    #         branch for branch in options.get('branches', [])
    #         if not branch['id'] in ('divider', 'group') and branch['selected']
    #     ]

    @api.model
    def _init_filter_size_company(self, options, previous_options=None):
        if not self.filter_size_company:
            return

        options['company_size'] = True
        options['company_size_ids'] = previous_options and previous_options.get(
            'company_size_ids') or []
        selected_company_size_ids = [int(company_size) for company_size in options['company_size_ids']]
        selected_company_size = selected_company_size_ids and self.env['vt.param'].browse(
            selected_company_size_ids) or self.env['vt.param'].search([('type', '=', 'number')])
        options['selected_company_size_ids'] = selected_company_size.mapped('title')

    @api.model
    def get_report_informations(self, options):
        if options and "is_popup" in options:
            options = options
        else:
            options = self._get_options(options)
        # branch_name = ''
        # branch_address = ''
        # branch_selected = self._get_options_branches(options)
        # if len(branch_selected) == 1:
        #     branch_id = self.env['hr.department'].browse(
        #         branch_selected[0]['id'])
        #     branch_name = branch_id.name
        #     branch_address
        # self._get_report_signatures(options)
        options['company_name'] = self.env.company.name
        # options['branch_name'] = branch_name
        info = {
            'context': self.env.context,
            'options': options,
            # 'report_data': self._get_report_data(options),
            # 'buttons': self._get_reports_buttons_in_sequence(),
            # 'footnotes': self._get_footnotes(options),
            # 'report_parameters': self._get_parameter(options),
        }
        return info

    @api.model
    def _get_options(self, previous_options=None):
        options = {
            'unfolded_lines':
                previous_options and previous_options.get('unfolded_lines') or [],
        }

        if self.filter_multi_company:
            if self._context.get('allowed_company_ids'):
                companies = self.env['res.company'].browse(
                    self._context['allowed_company_ids'])
            else:
                companies = self.env.companies
            if len(companies) > 1:
                options['multi_company'] = [{
                    'id': c.id,
                    'name': c.name
                } for c in companies]

        if self.filter_date:
            self._init_filter_date(options, previous_options=previous_options)
        if self.filter_comparison:
            self._init_filter_comparison(options,
                                         previous_options=previous_options)

        filter_list = [
            attr for attr in dir(self)
            if (attr.startswith('filter_') or attr.startswith('order_'))
               and attr not in ('filter_date', 'filter_comparison',
                                'filter_multi_company') and len(attr) > 7
               and not callable(getattr(self, attr))
        ]
        for filter_key in filter_list:
            options_key = filter_key[7:]
            init_func = getattr(self, '_init_%s' % filter_key, None)
            if init_func:
                init_func(options, previous_options=previous_options)
            else:
                filter_opt = getattr(self, filter_key, None)
                if filter_opt is not None:
                    if previous_options and options_key in previous_options:
                        options[options_key] = previous_options[options_key]
                    else:
                        options[options_key] = filter_opt
        # if previous_options and "filter_account" in previous_options:
        #     if isinstance(previous_options["filter_account"], str):
        #         options["filter_account"] = previous_options["filter_account"]
        if previous_options and "accounting_financial_report_id" in previous_options:
            options["accounting_financial_report_id"] = previous_options[
                "accounting_financial_report_id"]

        if previous_options and "refresh_data" in previous_options:
            options["refresh_data"] = previous_options["refresh_data"]
        return options

    @api.model
    def _get_dates_period(self,
                          options,
                          date_from,
                          date_to,
                          mode,
                          period_type=None,
                          strict_range=False):
        def match(dt_from, dt_to):
            return (dt_from, dt_to) == (date_from, date_to)

        string = None
        # If no date_from or not date_to, we are unable to determine a period
        if not period_type or period_type == 'custom':
            date = date_to or date_from
            company_fiscalyear_dates = self.env.company.compute_fiscalyear_dates(
                date)
            if match(company_fiscalyear_dates['date_from'],
                     company_fiscalyear_dates['date_to']):
                period_type = 'fiscalyear'
                if company_fiscalyear_dates.get('record'):
                    string = company_fiscalyear_dates['record'].name
            elif match(*date_utils.get_month(date)):
                period_type = 'month'
            elif match(*date_utils.get_quarter(date)):
                period_type = 'quarter'
            elif match(*date_utils.get_fiscal_year(date)):
                period_type = 'year'
            elif match(date_utils.get_month(date)[0], fields.Date.today()):
                period_type = 'today'
            else:
                period_type = 'custom'
        elif period_type == 'fiscalyear':
            date = date_to or date_from
            company_fiscalyear_dates = self.env.company.compute_fiscalyear_dates(
                date)
            record = company_fiscalyear_dates.get('record')
            string = record and record.name
        # elif period_type == 'quarter':
        additional_string = ''
        if 'lang' in self.env.context and self.env.context['lang'] == 'vi_VN':
            additional_string = "'năm '"
        if not string:
            # fy_day = self.env.company.fiscalyear_last_day
            # fy_month = int(self.env.company.fiscalyear_last_month)
            if mode == 'single':
                string = _('As of %s') % (format_date(
                    self.env, fields.Date.to_string(date_to)))
            elif period_type == 'year' or (
                    period_type == 'fiscalyear' and
                    (date_from, date_to) == date_utils.get_fiscal_year(date_to)):
                string = additional_string[1:-1] + date_to.strftime('%Y')
            elif period_type == 'fiscalyear' and (
                    date_from, date_to) == date_utils.get_fiscal_year(
                date_to):
                string = additional_string[1:-1] + '%s - ' + additional_string[
                                                             1:-1] + '%s' % (date_to.year - 1, date_to.year)
            elif period_type == 'month':
                format = "MMMM " + additional_string + "yyyy"
                string = format_date(self.env,
                                     fields.Date.to_string(date_to),
                                     date_format=format)
            elif period_type == 'quarter':
                quarter_names = get_quarter_names('wide',
                                                  locale=get_lang(
                                                      self.env).code)

                string = ("%s " + additional_string[1:-1] + "%s") % (
                    quarter_names[date_utils.get_quarter_number(date_to)],
                    date_to.year)
            else:
                dt_from_str = format_date(self.env,
                                          fields.Date.to_string(date_from))
                dt_to_str = format_date(self.env,
                                        fields.Date.to_string(date_to))
                string = _('From %s\nto  %s') % (dt_from_str, dt_to_str)

        return {
            'quarter': date_utils.get_quarter_number(date_to),
            'string': string,
            'period_type': period_type,
            'mode': mode,
            'strict_range': strict_range,
            'date_from': date_from and fields.Date.to_string(date_from)
                         or False,
            'date_to': fields.Date.to_string(date_to),
        }

    @api.model
    def _get_dates_previous_period(self, options, period_vals):
        '''Shift the period to the previous one.
        :param period_vals: A dictionary generated by the _get_dates_period method.
        :return:            A dictionary containing:
            * date_from * date_to * string * period_type *
        '''
        period_type = period_vals['period_type']
        mode = period_vals['mode']
        strict_range = period_vals.get('strict_range', False)
        date_from = fields.Date.from_string(period_vals['date_from'])
        date_to = date_from - datetime.timedelta(days=1)

        if period_type == 'fiscalyear':
            # date_to = date_utils.get_month(date_from)[0] - relativedelta(years=1)
            # Don't pass the period_type to _get_dates_period to be able to retrieve the account.fiscal.year record if
            # necessary.
            company_fiscalyear_dates = self.env.company.compute_fiscalyear_dates(
                date_to)
            return self._get_dates_period(
                options,
                company_fiscalyear_dates['date_from'],
                company_fiscalyear_dates['date_to'],
                mode,
                strict_range=strict_range)
        if period_type in ('month', 'today', 'custom'):
            return self._get_dates_period(options,
                                          *date_utils.get_month(date_to),
                                          mode,
                                          period_type='month',
                                          strict_range=strict_range)
        if period_type == 'quarter':
            return self._get_dates_period(options,
                                          *date_utils.get_quarter(date_to),
                                          mode,
                                          period_type='quarter',
                                          strict_range=strict_range)
        if period_type == 'year':
            return self._get_dates_period(options,
                                          *date_utils.get_fiscal_year(date_to),
                                          mode,
                                          period_type='year',
                                          strict_range=strict_range)
        return None

    @api.model
    def _init_filter_date(self, options, previous_options=None):
        keytime = self._context.get('key_time')
        map_keytime = {
            'mt': 'this_month',
            'qt': 'this_quarter',
            'yt': 'this_year',
            'ml': 'last_month',
            'ql': 'last_quarter',
            'yl': 'last_year',
            'm1': 'custom',
            'm2': 'custom',
            'm3': 'custom',
            'm4': 'custom',
            'm5': 'custom',
            'm6': 'custom',
            'm7': 'custom',
            'm8': 'custom',
            'm9': 'custom',
            'm10': 'custom',
            'm11': 'custom',
            'm12': 'custom',
        }
        dashboard_date_context = keytime and map_keytime.get(keytime)
        dashboard_date_from_context = False
        dashboard_date_to_context = False
        if dashboard_date_context == 'custom':
            today = datetime.date.today()
            dashboard_date_from_context = today.replace(month=int(keytime[1:]), day=1)
            endmonth = calendar.monthrange(today.year, int(keytime[1:]))
            dashboard_date_to_context = today.replace(month=int(keytime[1:]), day=endmonth[1])
        if self.filter_date is None:
            return

        previous_date = (previous_options or {}).get('date', {})

        # Default values.
        mode = previous_date.get('mode') or self.filter_date.get(
            'mode', 'range')
        options_filter = dashboard_date_context or previous_date.get('filter') or self.filter_date.get(
            'filter') or ('today' if mode == 'single' else 'fiscalyear')
        date_from = fields.Date.to_date(
            dashboard_date_from_context
            or previous_date.get('date_from')
            or self.filter_date.get('date_from'))
        date_to = fields.Date.to_date(
            dashboard_date_to_context or previous_date.get('date_to') or self.filter_date.get('date_to'))
        strict_range = previous_date.get('strict_range', False)

        # Create date option for each company.
        period_type = False
        if 'today' in options_filter:
            date_to = fields.Date.context_today(self)
            date_from = date_utils.get_month(date_to)[0]
        elif 'month' in options_filter:
            date_from, date_to = date_utils.get_month(
                fields.Date.context_today(self))
            period_type = 'month'
        elif 'quarter' in options_filter:
            date_from, date_to = date_utils.get_quarter(
                fields.Date.context_today(self))
            period_type = 'quarter'
        elif 'year' in options_filter:
            company_fiscalyear_dates = self.env.company.compute_fiscalyear_dates(
                fields.Date.context_today(self))
            date_from = company_fiscalyear_dates['date_from']
            date_to = company_fiscalyear_dates['date_to']
        elif not date_from:
            # options_filter == 'custom' && mode == 'single'
            date_from = date_utils.get_month(date_to)[0]
        # elif 'custom' in options_filter:
        #     date_from = date_utils.get_month(date_to)[0]-datetime.timedelta(days=1)

        options['date'] = self._get_dates_period(options,
                                                 date_from,
                                                 date_to,
                                                 mode,
                                                 period_type=period_type,
                                                 strict_range=strict_range)
        if 'last' in options_filter:
            options['date'] = self._get_dates_previous_period(
                options, options['date'])
        options['date']['filter'] = options_filter
        if 'custom_compare' in self.filter_date:
            options['date']['custom_compare'] = self.filter_date[
                'custom_compare']
        else:
            options['date']['custom_compare'] = True

    @api.model
    def _get_options_date_domain(self, options):
        def create_date_domain(options_date):
            date_field = options_date.get('date_field', 'date')
            domain = [(date_field, '<=', options_date['date_to'])]
            if options_date['mode'] == 'range':
                strict_range = options_date.get('strict_range')
                if not strict_range:
                    domain += [
                        '|', (date_field, '>=', options_date['date_from']),
                        ('account_id.user_type_id.include_initial_balance',
                         '=', True)
                    ]
                else:
                    domain += [(date_field, '>=', options_date['date_from'])]
            return domain

        if not options.get('date'):
            return []
        return create_date_domain(options['date'])

    @api.model
    def _init_filter_comparison(self, options, previous_options=None):
        if self.filter_comparison is None or not options.get('date'):
            return
        if self.filter_date['mode'] == 'single':
            option = options
            if 'date' in previous_options:
                option = previous_options
            self.filter_comparison['date_to'] = option['date']['date_to']
        elif self.filter_date['mode'] == 'range':
            current_year = fields.date.today().year
            if not self.filter_comparison.get('date_to'):
                self.filter_comparison['date_to'] = datetime.date(
                    current_year, 12, 31).strftime("%Y-%m-%d")
            if not self.filter_comparison.get('date_from'):
                self.filter_comparison['date_from'] = datetime.date(
                    current_year, 1, 1).strftime("%Y-%m-%d")
        cmp_filter = self.filter_comparison and self.filter_comparison.get(
            'filter', 'no_comparison')
        number_period = self.filter_comparison and self.filter_comparison.get(
            'number_period', 1)
        date_from = self.filter_comparison and self.filter_comparison.get(
            'date_from')
        date_to = self.filter_comparison and self.filter_comparison.get(
            'date_to')

        # Copy value from previous_options.
        previous_value = previous_options and previous_options.get(
            'comparison')
        if previous_value:
            cmp_filter = previous_value.get('filter') or cmp_filter
            # Copy dates if filter is custom.
            if cmp_filter == 'custom':
                if previous_value['date_from'] is not None:
                    date_from = previous_value['date_from']
                if previous_value['date_to'] is not None:
                    date_to = previous_value['date_to']

            # Copy the number of periods.
            if previous_value.get(
                    'number_period') and previous_value['number_period'] > 1:
                number_period = previous_value['number_period']

        options['comparison'] = {
            'filter': cmp_filter,
            'number_period': number_period
        }
        options['comparison']['date_from'] = date_from
        options['comparison']['date_to'] = date_to
        options['comparison']['periods'] = []

        if cmp_filter == 'no_comparison':
            return

        if cmp_filter == 'custom':
            number_period = 1

        previous_period = options['date']
        for index in range(0, number_period):
            if cmp_filter == 'previous_period':
                period_vals = self._get_dates_previous_period(
                    options, previous_period)
            elif cmp_filter == 'same_last_year':
                period_vals = self._get_dates_previous_year(
                    options, previous_period)
            else:
                date_from_obj = fields.Date.from_string(date_from)
                date_to_obj = fields.Date.from_string(date_to)
                strict_range = previous_period.get('strict_range', False)
                period_vals = self._get_dates_period(options,
                                                     date_from_obj,
                                                     date_to_obj,
                                                     previous_period['mode'],
                                                     strict_range=strict_range)
            options['comparison']['periods'].append(period_vals)
            previous_period = period_vals

        if len(options['comparison']['periods']) > 0:
            options['comparison'].update(options['comparison']['periods'][0])

    @api.model
    def _get_dates_previous_year(self, options, period_vals):
        '''Shift the period to the previous year.
        :param options:     The report options.
        :param period_vals: A dictionary generated by the _get_dates_period method.
        :return:            A dictionary containing:
            * date_from * date_to * string * period_type *
        '''
        period_type = period_vals['period_type']
        mode = period_vals['mode']
        strict_range = period_vals.get('strict_range', False)
        date_from = fields.Date.from_string(period_vals['date_from'])
        date_from = date_from - relativedelta(years=1)
        date_to = fields.Date.from_string(period_vals['date_to'])
        date_to = date_to - relativedelta(years=1)

        if period_type == 'month':
            date_from, date_to = date_utils.get_month(date_to)
        return self._get_dates_period(options,
                                      date_from,
                                      date_to,
                                      mode,
                                      period_type=period_type,
                                      strict_range=strict_range)

    @api.model
    def _init_filter_partner(self, options, previous_options=None):
        if not self.filter_partner:
            return

        options['partner'] = True
        options['partner_ids'] = previous_options and previous_options.get(
            'partner_ids') or []
        options[
            'partner_categories'] = previous_options and previous_options.get(
            'partner_categories') or []
        selected_partner_ids = [
            int(partner) for partner in options['partner_ids']
        ]
        selected_partners = selected_partner_ids and self.env[
            'res.partner'].browse(
            selected_partner_ids) or self.env['res.partner']
        options['selected_partner_ids'] = selected_partners.mapped('name')
        selected_partner_category_ids = [
            int(category) for category in options['partner_categories']
        ]
        selected_partner_categories = selected_partner_category_ids and self.env[
            'res.partner.category'].browse(
            selected_partner_category_ids
        ) or self.env['res.partner.category']
        options[
            'selected_partner_categories'] = selected_partner_categories.mapped(
            'name')

    @api.model
    def _get_options_partner_domain(self, options):
        domain = []
        if options.get('partner_ids'):
            partner_ids = [int(partner) for partner in options['partner_ids']]
            domain.append(('partner_id', 'in', partner_ids))
        if options.get('partner_categories'):
            partner_category_ids = [
                int(category) for category in options['partner_categories']
            ]
            domain.append(
                ('partner_id.category_id', 'in', partner_category_ids))
        return domain

    @api.model
    def _init_filter_branches(self, options, previous_options=None):
        if not self.filter_branches:
            return

        previous_company = False
        if previous_options and previous_options.get('branches'):
            branch_map = dict((opt['id'], opt['selected'])
                              for opt in previous_options['branches']
                              if opt['id'] != 'divider' and 'selected' in opt)
        else:
            branch_map = {}
        options['branches'] = []
        emp = self.env['hr.employee'].search([('user_id', '=', self.env.uid)])
        for b in self._get_filter_branches():
            if b.company_id != previous_company:
                options['branches'].append({
                    'id': 'divider',
                    'name': b.company_id.name
                })
                previous_company = b.company_id
            selected = False
            if ((emp.department_id.department_level.id not in [1, 2, 3] and b.id == emp.department_id.parent_id.id) or (
                    emp.department_id.department_level.id in [1, 2, 3] and b.id == emp.department_id.id)) and not previous_options.get('branches'):
                selected = True
            elif b.id != emp.department_id.parent_id.id or previous_options.get('branches'):
                selected = branch_map.get(b.id)
            options['branches'].append({
                'id': b.id,
                'name': b.name,
                'code': b.code,
                'selected': selected,
            })
        count = 0
        for branch in options['branches']:
            if branch.get('selected'):
                count += 1
        if count == 0:
            de_id = emp.department_id.id if emp.department_id.department_level.id in [1, 2, 3] else emp.department_id.parent_id.id
            for branch in options['branches']:
                if branch.get('id') == de_id:
                    branch.update({
                        'selected': True
                    })
        previous_options['branches'] = options['branches']

    @api.model
    def _init_filter_campaign(self, options, previous_options=None):
        if not self.filter_campaign:
            return
        if previous_options and previous_options.get('campaign'):
            if isinstance(previous_options.get('campaign'), list):
                campaign_map = dict((opt['id'], opt['selected'])
                                    for opt in previous_options['campaign'])
            else:
                campaign_map = {previous_options.get('campaign'): True}
        else:
            campaign_map = {}
        branch_id = False
        for item in options.get('branch'):
            if item.get('selected'):
                branch_id = item.get('id')
        options['campaign'] = []
        data_campaign = self.env['vt.campaign'].search([('branch_id', '=', branch_id)])
        for c in data_campaign:
            options['campaign'].append({
                'id': c.id,
                'name': c.campaign_name,
                'code': c.campaign_code,
                'selected': campaign_map.get(c.id)
            })

    @api.model
    def _init_filter_product_group(self, options, previous_options=None):
        if not self.filter_product_group:
            return

        options['product_group'] = True
        options['product_group_ids'] = previous_options and previous_options.get(
            'product_group_ids') or []
        selected_product_group_ids = [int(product_group) for product_group in options['product_group_ids']]
        selected_product_group = selected_product_group_ids and self.env['product.category'].browse(
            selected_product_group_ids) or self.env['product.category'].search([])
        options['selected_product_group_ids'] = selected_product_group.mapped('name')

    @api.model
    def _init_filter_selling_step(self, options, previous_options=None):
        if not self.filter_selling_step:
            return

        options['selling_step'] = True
        options['selling_step_ids'] = previous_options and previous_options.get(
            'selling_step_ids') or []
        selected_selling_step_ids = [int(selling_step) for selling_step in options['selling_step_ids']]
        selected_selling_step = selected_selling_step_ids and self.env['vt.param'].browse(
            selected_selling_step_ids) or self.env['vt.param'].search([('type', '=', 'phase')])
        options['selected_selling_step_ids'] = selected_selling_step.mapped('title')

    @api.model
    def get_domain_department(self, domain, model):
        user = self.env.user
        employee = user.employee_id
        department_ids = []
        if model in ('bms.dashboard.sales.overview'):
            ## Giám đốc
            if user.has_group('vt_crm.vt_crm_marketing_director') or user.has_group('vt_crm.vt_customer_care_director')\
                    or user.has_group('vt_crm.sale_order_director') or user.has_group('vt_crm.vt_crm_marketing_manager'):
                department_all = self.get_sub_department(domain)
                for rec in department_all:
                    department_search = self.env['hr.department'].search([('id', '=', rec), ('department_level', 'not in', (1, 2, 3))])
                    if department_search:
                        department_ids.append(department_search.id)

            ## Trưởng phòng
            elif user.has_group('sales_team.group_sale_salesman_all_leads') or user.has_group(
                    'vt_crm.vt_customer_care_manager'):
                department_ids.append(employee.department_id.id)
            else:
                department_ids.append(employee.department_id.id)
        if model in ('dashboard.departments.kpi', 'summary.sales.results','sales.opportunity.sales'):
            ## Giám đốc
            if user.has_group('vt_crm.vt_crm_marketing_director') or user.has_group('vt_crm.vt_customer_care_director')\
                    or user.has_group('vt_crm.sale_order_director') :
                department_all = self.get_sub_department(domain)
                for rec in department_all:
                    department_search = self.env['hr.department'].search([('id', '=', rec), ('department_level', 'not in', (1, 2, 3))])
                    if department_search:
                        department_ids.append(department_search.id)
            ## Trưởng phòng
            elif user.has_group('sales_team.group_sale_salesman_all_leads') or user.has_group(
                    'vt_crm.vt_customer_care_manager') or user.has_group('vt_crm.vt_crm_marketing_manager'):
                department_ids.append(employee.department_id.id)
            else:
                department_ids.append(employee.department_id.id)
        if model in ('dashboard.marketing.campaign'):
            ## Giám đốc
            if user.has_group('vt_crm.vt_crm_marketing_director') or user.has_group('vt_crm.vt_customer_care_director') \
                    or user.has_group('vt_crm.sale_order_director') or user.has_group(
                'vt_crm.vt_crm_marketing_manager') or \
                    user.has_group('vt_crm.vt_customer_care_manager') or user.has_group(
                'vt_crm.vt_crm_marketing_employee') \
                    or user.has_group('vt_crm.vt_customer_care_employee'):
                department_all = self.get_sub_department(domain)
                for rec in department_all:
                    department_search = self.env['hr.department'].search(
                        [('id', '=', rec), ('department_level', 'not in', (1, 2, 3))])
                    if department_search:
                        department_ids.append(department_search.id)
            ## Trưởng phòng
            elif user.has_group('sales_team.group_sale_salesman_all_leads'):
                department_ids.append(employee.department_id.id)
            ##Nhân viên
            elif user.has_group('sales_team.group_sale_salesman'):
                department_ids.append(employee.department_id.id)
        return department_ids
