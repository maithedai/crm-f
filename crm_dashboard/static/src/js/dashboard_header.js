odoo.define('crm_dashboard.CrmdashboardheaderWidget', function (require) {
    "use strict";
    var core = require('web.core');
    var AbstractAction = require('web.AbstractAction');
    var datepicker = require("web.datepicker");
    var field_utils = require("web.field_utils");
    var RelationalFields = require("web.relational_fields");
    var StandaloneFieldManagerMixin = require("web.StandaloneFieldManagerMixin");
    var Widget = require("web.Widget");
//    var WarningDialog = require("web.CrashManager").WarningDialog;
    var _t = core._t;

    var QWeb = core.qweb;

    var CrmM2MFilters = Widget.extend(StandaloneFieldManagerMixin, {
        /**
         * @constructor
         * @param {Object} fields
         */
        init: function (parent, fields) {
            this._super.apply(this, arguments);
            StandaloneFieldManagerMixin.init.call(this);
            this.fields = fields;
            this.widgets = {};
        },
        /**
         * @override
         */
        willStart: function () {
            var self = this;
            var defs = [this._super.apply(this, arguments)];
            _.each(this.fields, function (field, fieldName) {
                defs.push(self._makeM2MWidget(field, fieldName));
            });
            return Promise.all(defs);
        },
        /**
         * @override
         */
        start: function () {
            var self = this;
            var $content = $(QWeb.render("crm_dashboard.m2mWidgetTable", {fields: this.fields}));
            self.$el.append($content);
            _.each(this.fields, function (field, fieldName) {
                self.widgets[fieldName].appendTo($content.find('#' + fieldName + '_field'));
            });
            return this._super.apply(this, arguments);
        },

        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------

        /**
         * This method will be called whenever a field value has changed and has
         * been confirmed by the model.
         *
         * @private
         * @override
         * @returns {Promise}
         */
        _confirmChange: function (ev) {
            var self = this;
            var result = StandaloneFieldManagerMixin._confirmChange.apply(this, arguments);
            var data = {};
            _.each(this.fields, function (filter, fieldName) {
                data[fieldName] = self.widgets[fieldName].value.res_ids;
            });
            this.trigger_up('value_changed', data);
            return result;
        },
        /**
         * This method will create a record and initialize M2M widget.
         *
         * @private
         * @param {Object} fieldInfo
         * @param {string} fieldName
         * @returns {Promise}
         */
        _makeM2MWidget: function (fieldInfo, fieldName) {
            var self = this;
            var options = {};
            options[fieldName] = {
                options: {
                    no_create_edit: true,
                    no_create: true,
                }
            };

            return this.model.makeRecord(fieldInfo.modelName, [{
                fields: [{
                    name: 'id',
                    type: 'integer',
                }, {
                    name: 'display_name',
                    type: 'char',
                }],
                name: fieldName,
                relation: fieldInfo.modelName,
                domain: fieldInfo.domain,
                context: fieldInfo.context,
                type: 'many2many',
                value: fieldInfo.value,
            }], options).then(function (recordID) {
                self.widgets[fieldName] = new RelationalFields.FieldMany2ManyTags(self,
                    fieldName,
                    self.model.get(recordID),
                    {mode: 'edit', domain: fieldInfo.domain, context: fieldInfo.context}
                );
                self._registerWidget(recordID, fieldName, self.widgets[fieldName]);
            });
        },
    });

    var CrmdashboardheaderWidget = AbstractAction.extend({
        hasControlPanel: true,

        events: {
            'click .o_search_options .dropdown-menu': '_onClickDropDownMenu',
            'click #crm-export-data': '_onClickExportData',
            'click #crm-reload-dashboard': '_onClickReloadData',
            'click #filter-drop-header': function () {
                let i_element = self.$(".all-filter-header").find("i");
                    let current_className = "fa-minus-square-o";
                    let next_className = "fa-plus-square-o";
                    if (i_element.hasClass(current_className)) {
                        i_element.removeClass(current_className);
                        self.$(".collapse.display-update-hd").removeClass('display-update-hd');
                        self.$(".rotate-icon").removeClass('fa-angle-up');
                        self.$(".rotate-icon").addClass('fa-angle-down');
                        self.$(".hd-padding").css({"padding-bottom": "330px","border-bottom": "1.5px solid rgb(233, 239, 253) !important"})

                    } else {
                        i_element.removeClass(next_className);
                        next_className = "fa-minus-square-o";
                        self.$(".collapse").addClass('display-update-hd');
                        self.$(".rotate-icon").removeClass('fa-angle-down');
                        self.$(".rotate-icon").addClass('fa-angle-up');
                        self.$(".hd-padding").css({"padding-bottom": "0px","border-bottom": "1.5px solid rgb(233, 239, 253) !important"})
                    }
                    i_element.addClass(next_className);

            },
        },

        custom_events: {
            'value_changed': function (ev) {
                var self = this;
                var check_state_by_industry = false
                var check_career = false
                var check_users = false
                var check_user = false
                var check_department = false
                if (ev.data.account_ids != null && ev.data.account_ids != undefined) {
                    self.report_options.account_ids = ev.data.account_ids;
                }
                if (ev.data.partner_ids != null && ev.data.partner_ids != undefined) {
                    self.report_options.partner_ids = ev.data.partner_ids;
                }
                if (ev.data.product_ids != null && ev.data.product_ids != undefined) {
                    self.report_options.product_ids = ev.data.product_ids;
                }
                if (ev.data.source_ids != null && ev.data.source_ids != undefined) {
                    self.report_options.source_ids = ev.data.source_ids;
                }
                if (ev.data.reason_fail_ids != null && ev.data.reason_fail_ids != undefined) {
                    self.report_options.reason_fail_ids = ev.data.reason_fail_ids;
                }
                if (ev.data.company_size_ids != null && ev.data.company_size_ids != undefined) {
                    self.report_options.company_size_ids = ev.data.company_size_ids;
                }
                if (ev.data.state_ids != null && ev.data.state_ids != undefined) {
                    self.report_options.state_ids = ev.data.state_ids;
                    check_state_by_industry = true
                }
                if (ev.data.career_ids != null && ev.data.career_ids != undefined) {
                    self.report_options.career_ids = ev.data.career_ids;
                    check_career = true
                }
                if (ev.data.state_m2m_ids != null && ev.data.state_m2m_ids != undefined) {
                    self.report_options.state_m2m_ids = ev.data.state_m2m_ids;
                }
                if (ev.data.analytic_accounts != null && ev.data.analytic_accounts != undefined) {
                    self.report_options.analytic_accounts = ev.data.analytic_accounts;
                }
                if (ev.data.analytic_tags != null && ev.data.analytic_tags != undefined) {
                    self.report_options.analytic_tags = ev.data.analytic_tags;
                }
                if (ev.data.department_ids != null && ev.data.department_ids != undefined) {
                    self.report_options.department_ids = ev.data.department_ids;
                    check_department = true
                }
                if (ev.data.location_ids != null && ev.data.location_ids != undefined) {
                    self.report_options.location_ids = ev.data.location_ids;
                }
                if (ev.data.cost_type_ids != null && ev.data.cost_type_ids != undefined) {
                    self.report_options.cost_type_ids = ev.data.cost_type_ids;
                }
                if (ev.data.cost_object_ids != null && ev.data.cost_object_ids != undefined) {
                    self.report_options.cost_object_ids = ev.data.cost_object_ids;
                }
                if (ev.data.asset_ids != null && ev.data.asset_ids != undefined) {
                    self.report_options.asset_ids = ev.data.asset_ids;
                }
                if (ev.data.asset_type_ids != null && ev.data.asset_type_ids != undefined) {
                    self.report_options.asset_type_ids = ev.data.asset_type_ids;
                }
                if (ev.data.product_category_ids != null && ev.data.product_category_ids != undefined) {
                    self.report_options.product_category_ids = ev.data.product_category_ids;
                }
                if (ev.data.product_group_ids != null && ev.data.product_group_ids != undefined) {
                    self.report_options.product_group_ids = ev.data.product_group_ids;
                }
                if (ev.data.branches != null && ev.data.branches != undefined) {
                    self.report_options.branches = ev.data.branches;
                }
                if (ev.data.branch != null && ev.data.branch != undefined) {
                    self.report_options.branch = ev.data.branch;
                }
                if (ev.data.campaign != null && ev.data.campaign != undefined) {
                    self.report_options.campaign = ev.data.campaign;
                }
                if (ev.data.top_selling_ids != null && ev.data.top_selling_ids != undefined) {
                    self.report_options.top_selling_ids = ev.data.top_selling_ids;
                }
                if (ev.data.cus_type_ids != null && ev.data.cus_type_ids != undefined) {
                    self.report_options.cus_type_ids = ev.data.cus_type_ids;
                }
                if (ev.data.res_user_ids != null && ev.data.res_user_ids != undefined) {
                    self.report_options.selected_res_users = ev.data.res_user_ids;
                    check_users = true
                }
                // if (ev.data.user_ids != null && ev.data.user_ids != undefined) {
                //     self.report_options.selected_users = ev.data.user_ids;
                //     check_user = true
                // }
                if (ev.data.selling_step_ids != null && ev.data.selling_step_ids != undefined) {
                    self.report_options.selling_step_ids = ev.data.selling_step_ids;
                }
                return self.reload().then(function () {
                    self.$searchview_buttons.find('.account_partner_filter').click();
                    self.$searchview_buttons.find('.product_filter').click();
                    self.$searchview_buttons.find('.source_filter').click();
                    if (check_state_by_industry == true) {
                        self.$searchview_buttons.find('.state_filter').click();
                    }
                    if (check_career == true) {
                        self.$searchview_buttons.find('.career_filter').click();
                    }
                    self.$searchview_buttons.find('.filter_size_company').click();
                    self.$searchview_buttons.find('.account_analytic_filter').click();
                    self.$searchview_buttons.find('.product_group_filter').click();
                    self.$searchview_buttons.find('.state_m2m_filter').click();
                    self.$searchview_buttons.find('.top_selling_filter').click();
                    self.$searchview_buttons.find('.cus_type_filter').click();
                    self.$searchview_buttons.find('.reason_fail_filter').click();
                    self.$searchview_buttons.find('.selling_step_filter').click();
                    if (check_department == true) {
                        self.$searchview_buttons.find('.department_filter').click();
                    }
                    if (check_user == true) {
                        self.$searchview_buttons.find('.user_filter').click();
                    }
                    if (check_users == true) {
                        self.$searchview_buttons.find('.res_user_filter').click();
                    }
                });
            },
        },

        _onClickDropDownMenu: function (ev) {
            ev.stopPropagation();
        },

        _onClickExportData: function () {
            var self = this;
            self._rpc({
                model: this.report_model,
                method: 'export_data',
                args: [self.values, self.report_options, self.report_action],
            }).then(function (result) {
                var pom = document.createElement('a');
                pom.setAttribute('href', result.url);
                pom.click();
            })
        },

        _onClickReloadData: function () {
            this.reload();
            return;
        },

        init: function (parent, action) {
            this.actionManager = parent;
            this.odoo_context = action.context;
            this.report_model = action.context.model;
            this.report_action = action;
            this.expand_key = [];
            this.accounting_standard = "";
            if (action.context.options != undefined) {
                this.report_options = action.context.options;
            }
            if (action.context.expand_key != undefined) {
                this.expand_key = action.context.expand_key;
            }
            this.refresh = false;
            return this._super.apply(this, arguments);
        },


        parse_reports_informations: function (values) {
            this.report_options = values.options;
            this.buttons = values.buttons;
            this.footnotes = values.footnotes;
            this.report_parameters = values.report_parameters;
            if (values.currency != undefined) {
                this.currency = values.currency;
            }
        },

        render_searchview_buttons: async function () {
            var self = this;
            if (self.odoo_context.parameter_type == 'pop_up') {

            } else {
                this.$date_string = "";
                if (this.report_options.date) {
                    // var dateFrom = Date.parse(this.report_options.date.date_from);
                    // var dateTo = Date.parse(this.report_options.date.date_to);
                    // this.$date_string = _t(`From date: ${new Date(dateFrom).toLocaleDateString('vi-VN')} to: ${new Date(dateTo).toLocaleDateString('vi-VN')}`);
                    this.$date_string = this.report_options.date.string;
                }
                // delete this.report_options.account_books;
                if (window.matchMedia('(min-width: 600px)').matches) {
                    this.$searchview_buttons = $(QWeb.render("crm_dashboard.dashboard_header", {options: this.report_options}));
                } else {
                    this.$searchview_buttons = $(QWeb.render("crm_dashboard.dashboard_header2", {options: this.report_options}));
                }
                var $datetimepickers = this.$searchview_buttons.find('.js_account_reports_datetimepicker');
                var options = { // Set the options for the datetimepickers
                    locale: moment.locale(),
                    format: 'L',
                    icons: {
                        date: "fa fa-calendar",
                    },
                };
                // attach datepicker
                $datetimepickers.each(function () {
                    var name = $(this).find('input').attr('name');
                    var defaultValue = $(this).data('default-value');
                    $(this).datetimepicker(options);
                    var dt = new datepicker.DateWidget(options);
                    dt.replace($(this)).then(function () {
                        dt.$el.find('input').attr('name', name);
                        if (defaultValue) { // Set its default value if there is one
                            dt.setValue(moment(defaultValue));
                        }
                    });
                });
                // format date that needs to be show in user lang
                _.each(this.$searchview_buttons.find('.js_format_date'), function (dt) {
                    var date_value = $(dt).html();
                    $(dt).html((new moment(date_value)).format('ll'));
                });
                // fold all menu
                this.$searchview_buttons.find('.js_foldable_trigger').click(function (event) {
                    $(this).toggleClass('o_closed_menu o_open_menu');
                    self.$searchview_buttons.find('.o_foldable_menu[data-filter="' + $(this).data('filter') + '"]').toggleClass('o_closed_menu');
                });
                // render filter (add selected class to the options that are selected)
                _.each(self.report_options, function (k) {
                    if (k !== null && k.filter !== undefined) {
                        self.$searchview_buttons.find('[data-filter="' + k.filter + '"]').addClass('selected');
                    }
                });

                // _.each(this.$searchview_buttons.find('.js_account_reports_one_choice_filter'), function (k) {
                //     $(k).toggleClass('selected', '' + self.report_options[$(k).data('filter')] === '' + $(k).data('id'));
                // });
                _.each(this.$searchview_buttons.find('.js_account_report_choice_filter'), function (k) {
                    $(k).toggleClass('selected', (_.filter(self.report_options[$(k).data('filter')], function (el) {
                        return '' + el.id == '' + $(k).data('id') && el.selected === true;
                    })).length > 0);
                });


                _.each(this.$searchview_buttons.find('.js_account_report_choice_filter_account_tax'), function (k) {
                    $(k).toggleClass('selected', (_.filter(self.report_options[$(k).data('filter')], function (el) {
                        return '' + el.code == '' + $(k).data('id') && el.selected === true;
                    })).length > 0);
                });
                $('.js_account_report_group_choice_filter', this.$searchview_buttons).each(function (i, el) {
                    var $el = $(el);
                    var ids = $el.data('member-ids');
                    $el.toggleClass('selected', _.every(self.report_options[$el.data('filter')], function (member) {
                        // only look for actual ids, discard separators and section titles
                        if (typeof member.id == 'number') {
                            // true if selected and member or non member and non selected
                            return member.selected === (ids.indexOf(member.id) > -1);
                        } else {
                            return true;
                        }
                    }));
                });

                _.each(this.$searchview_buttons.find('.js_account_reports_one_choice_filter'), function (k) {
                    // $(k).toggleClass('selected', '' + self.report_options[$(k).data('filter')] === '' + $(k).data('id'));
                    $(k).toggleClass('selected', (_.filter(self.report_options[$(k).data('filter')], function (el) {
                        return '' + el.id == '' + $(k).data('id') && el.selected === true;
                    })).length > 0);
                });
                // click events
                this.$searchview_buttons.find('.reset_data_filter').click(function (event) {
                    self.report_options['res_user_ids'] = []
                    self.report_options['user_ids'] = []
                    self.report_options['selected_res_users'] = []
                    self.report_options['department_ids'] = []
                });
                this.$searchview_buttons.find('.js_account_report_date_filter').click(function (event) {
                    self.report_options.date.filter = $(this).data('filter');
                    var error = false;
                    var error_date = false
                    var error_limit_date = false
                    if ($(this).data('filter') === 'custom') {
                        var date_from = self.$searchview_buttons.find('.o_datepicker_input[name="date_from"]');
                        var date_to = self.$searchview_buttons.find('.o_datepicker_input[name="date_to"]');
                        if (date_from.length > 0) {
                            let date_from_string = moment.utc(date_from.val(), 'DD/MM/YYYY');
                            let date_to_string = moment.utc(date_to.val(), 'DD/MM/YYYY');
                            error = date_from.val() === "" || date_to.val() === "";
                            error_date = new Date(date_from_string).getTime() > new Date(date_to_string).getTime()
                            error_limit_date = new Date(date_from_string.add(90, 'days')).getTime() < new Date(date_to_string).getTime()
                            self.report_options.date.date_from = field_utils.parse.date(date_from.val());
                            self.report_options.date.date_to = field_utils.parse.date(date_to.val());
                        } else {
                            error = date_to.val() === "";
                            self.report_options.date.date_to = field_utils.parse.date(date_to.val());
                        }
                    }
//                    if (error) {
//                        new WarningDialog(self, {
//                            title: _t("Warning"),
//                        }, {
//                            message: _t("Date cannot be empty")
//                        }).open();
//                    } else if (error_date) {
//                        new WarningDialog(self, {
//                            title: _t("Warning"),
//                        }, {
//                            message: _t("Date from must before date to")
//                        }).open();
//                    } else if (error_limit_date) {
//                        new WarningDialog(self, {
//                            title: _t("Warning"),
//                        }, {
//                            message: _t("Selection period must be less than or equal to 90 days")
//                        }).open();
//                    } else {
//                        self.reload();
//                    }
                });

                this.$searchview_buttons.find('.js_account_report_choice_filter').click(function (event) {
                    var option_value = $(this).data('filter');
                    var option_id = $(this).data('id');
                    _.filter(self.report_options[option_value], function (el) {
                        if ('' + el.id == '' + option_id) {
                            if (el.selected === undefined || el.selected === null) {
                                el.selected = false;
                            }
                            el.selected = !el.selected;
                        } else if (option_value === 'ir_filters') {
                            el.selected = false;
                        }
                        return el;
                    });
                    self.reload();
                });

                var rate_handler = function (event) {
                    var option_value = $(this).data('filter');
                    if (option_value == 'current_currency') {
                        delete self.report_options.currency_rates;
                    } else if (option_value == 'custom_currency') {
                        _.each($('input.js_account_report_custom_currency_input'), function (input) {
                            self.report_options.currency_rates[input.name].rate = input.value;
                        });
                    }
                    self.reload();
                }
                this.$searchview_buttons.find('.js_account_reports_one_choice_filter').click(function (event) {
                    var check = self.report_options[$(this).data('filter')]
                    var selected_id = 0
                    for (let i = 0; i < check.length; i++) {
                        if (check[i]['id'] == $(this).data('id') && check[i]['selected'] == true) {
                            selected_id = 1
                            check[i]['selected'] = null
                        }
                    }
                    if (selected_id == 0) {
                        self.report_options[$(this).data('filter')] = $(this).data('id');
                    } else {
                        self.report_options[$(this).data('filter')] = null;
                    }
                    self.reload();
                });
                this.$searchview_buttons.find('.js_account_report_date_cmp_filter').click(function (event) {
                    self.report_options.comparison.filter = $(this).data('filter');
                    var error = false;
                    var number_period = $(this).parent().find('input[name="periods_number"]');
                    self.report_options.comparison.number_period = (number_period.length > 0) ? parseInt(number_period.val()) : 1;
                    if ($(this).data('filter') === 'custom') {
                        var date_from = self.$searchview_buttons.find('.o_datepicker_input[name="date_from_cmp"]');
                        var date_to = self.$searchview_buttons.find('.o_datepicker_input[name="date_to_cmp"]');
                        if (date_from.length > 0) {
                            error = date_from.val() === "" || date_to.val() === "";
                            self.report_options.comparison.date_from = field_utils.parse.date(date_from.val());
                            self.report_options.comparison.date_to = field_utils.parse.date(date_to.val());
                        } else {
                            error = date_to.val() === "";
                            self.report_options.comparison.date_to = field_utils.parse.date(date_to.val());
                        }
                    }
//                    if (error) {
//                        new WarningDialog(self, {
//                            title: _t("Odoo Warning"),
//                        }, {
//                            message: _t("Date cannot be empty")
//                        }).open();
//                    } else {
//                        self.reload();
//                    }
                });

                // partner filter
                if (this.report_options.partner) {
                    // if (!this.CrmM2MFilters) {
                    var fields = {};
                    if ('partner_ids' in this.report_options) {
                        fields['partner_ids'] = {
                            label: _t('Đối tượng'),
                            modelName: 'res.partner',
                            value: this.report_options.partner_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_account_partner_m2m'));
                    }
                    // } else {
                    //   this.$searchview_buttons.find('.js_account_partner_m2m').append(this.CrmM2MFilters.$el);
                    // }
                }

                if (this.report_options.account) {
                    // if (!this.CrmM2MFilters) {
                    var fields = {};
                    if ('account_ids' in this.report_options) {
                        fields['account_ids'] = {
                            label: _t('Accounts'),
                            modelName: 'account.account',
                            value: this.report_options.account_ids.map(Number),
                        };
                    }
                }

                if (!_.isEmpty(fields)) {
                    this.CrmM2MFilters = new CrmM2MFilters(this, fields);
                    this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_account_account_m2m'));
                }

                if (this.report_options.analytic) {
                    // if (!this.CrmM2MFilters) {
                    var fields = {};
                    if (this.report_options.analytic_accounts) {
                        fields['analytic_accounts'] = {
                            label: _t('Accounts'),
                            modelName: 'account.analytic.account',
                            value: this.report_options.analytic_accounts.map(Number),
                        };
                    }
                    if (this.report_options.analytic_tags) {
                        fields['analytic_tags'] = {
                            label: _t('Tags'),
                            modelName: 'account.analytic.tag',
                            value: this.report_options.analytic_tags.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_account_analytic_m2m'));
                    }
                    // } else {
                    //   this.$searchview_buttons.find('.js_account_analytic_m2m').append(this.CrmM2MFilters.$el);
                    // }
                }

                // ############################################ Bổ sung tham số báo cáo #####################################################//
                if (this.report_options.product) {
                    var fields = {};
                    if ('product_ids' in this.report_options) {
                        fields['product_ids'] = {
                            label: _t('Sản phẩm'),
                            modelName: 'product.product',
                            value: this.report_options.product_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_product_m2m'));
                    }
                }
                if (this.report_options.source) {
                    var fields = {};
                    if ('source_ids' in this.report_options) {
                        fields['source_ids'] = {
                            label: _t('Nguồn'),
                            modelName: 'vt.param',
                            domain: [['type', '=', 'source']],
                            value: this.report_options.source_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_source_m2m'));
                    }
                }

                if (this.report_options.company_size) {
                    var fields = {};
                    if ('company_size_ids' in this.report_options) {
                        fields['company_size_ids'] = {
                            label: _t('Quy mô'),
                            modelName: 'vt.param',
                            domain: [['type', '=', 'number']],
                            value: this.report_options.company_size_ids.map(Number),
                        }
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_company_size_m2m'));
                    }
                }
                if (this.report_options.state_m2m) {
                    var fields = {};
                    if ('state_m2m_ids' in this.report_options) {
                        fields['state_m2m_ids'] = {
                            label: _t('Tình thành'),
                            modelName: 'res.country.state',
                            domain: [['country_id.code', '=', 'VN']],
                            value: this.report_options.state_m2m_ids.map(Number),
                        }
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_state_m2m_m2m'));
                    }
                }

                if (this.report_options.reason_fail) {
                    var fields = {};
                    if ('reason_fail_ids' in this.report_options) {
                        fields['reason_fail_ids'] = {
                            label: _t('Nguyên nhân'),
                            modelName: 'vt.param',
                            domain: [['type', '=', 'failure']],
                            value: this.report_options.reason_fail_ids.map(Number),
                        }
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_reason_fail_m2m'));
                    }
                }

                if (this.report_options.career) {
                    var fields = {};
                    if ('career_ids' in this.report_options) {
                        fields['career_ids'] = {
                            label: _t('Ngành nghề'),
                            modelName: 'vt.param',
                            domain: [['type', '=', 'career']],
                            value: this.report_options.career_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_career_m2m'));
                    }
                }
                if (this.report_options.state) {
                    var fields = {};
                    var value_state = [];
                    if (this.report_options.state_ids.length > 1) {
                        this.displayNotification({
                            title: ("Thông báo"),
                            message: ("Chỉ được chọn một thành phố!"),
                            type: 'danger',
                        });
                        this.report_options.state_ids = [this.report_options.state_ids.map(Number)['0']]
                    }
                    if ('state_ids' in this.report_options) {
                        fields['state_ids'] = {
                            label: _t('Thành phố'),
                            modelName: 'res.country.state',
                            domain: [['country_id', '=', 241]],
                            value: this.report_options.state_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_state_m2m'));
                    }
                }
                if (this.report_options.construction) {
                    var fields = {};
                    if ('construction_ids' in this.report_options) {
                        fields['construction_ids'] = {
                            label: _t('Công trình'),
                            modelName: 'account.construction',
                            value: this.report_options.construction_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_construction_m2m'));
                    }
                }

                if (this.report_options.location) {
                    var field_location = {};
                    if ('location_ids' in this.report_options) {
                        field_location['location_ids'] = {
                            label: _t('Kho'),
                            modelName: 'stock.location',
                            value: this.report_options.location_ids.map(Number),
                        };
                    }

                    if (!_.isEmpty(field_location)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, field_location);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_location_m2m'));
                    }
                }
                if (this.report_options.cost_type) {
                    var field_cost_type = {};
                    if ('cost_type_ids' in this.report_options) {
                        field_cost_type['cost_type_ids'] = {
                            label: _t('Khoản mục chi phí'),
                            modelName: 'account.cost.type',
                            value: this.report_options.cost_type_ids.map(Number),
                        };
                    }

                    if (!_.isEmpty(field_cost_type)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, field_cost_type);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_cost_type_m2m'));
                    }
                }
                if (this.report_options.cost_object) {
                    var field_cost_object = {};
                    if ('cost_object_ids' in this.report_options) {
                        field_cost_object['cost_object_ids'] = {
                            label: _t('Đối tượng THCP'),
                            modelName: 'account.cost.object',
                            value: this.report_options.cost_object_ids.map(Number)
                        };
                    }

                    if (!_.isEmpty(field_cost_object)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, field_cost_object);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_cost_object_m2m'));
                    }
                }
                if (this.report_options.asset) {
                    var field_asset = {};
                    if ('asset_ids' in this.report_options) {
                        field_asset['asset_ids'] = {
                            label: _t('Tài sản'),
                            modelName: 'account.asset.asset',
                            value: this.report_options.asset_ids.map(Number)
                        };
                    }

                    if (!_.isEmpty(field_asset)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, field_asset);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_asset_m2m'));
                    }
                }

                if (this.report_options.asset_type) {
                    var field_asset_type = {};
                    if ('asset_type_ids' in this.report_options) {
                        field_asset_type['asset_type_ids'] = {
                            label: _t('Kiểu tài sản'),
                            modelName: 'account.asset.asset',
                            value: this.report_options.asset_type_ids.map(Number)
                        };
                    }

                    if (!_.isEmpty(field_asset_type)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, field_asset_type);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_asset_type_m2m'));
                    }
                }
                if (this.report_options.product_category) {
                    var field_product_category = {};
                    if ('product_category_ids' in this.report_options) {
                        field_product_category['product_category_ids'] = {
                            label: _t('Nhóm hàng hóa'),
                            modelName: 'product.category',
                            value: this.report_options.product_category_ids.map(Number)
                        };
                    }

                    if (!_.isEmpty(field_product_category)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, field_product_category);
                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_product_category_m2m'));
                    }
                }
                if (this.report_options.product_group) {
                    var fields = {};
                    if ('product_group_ids' in this.report_options) {
                        fields['product_group_ids'] = {
                            label: _t('Nhóm sản phẩm'),
                            modelName: 'product.category',
                            value: this.report_options.product_group_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_product_group_m2m'));
                    }
                }
                if (this.report_options.department) {
                    var fields = {};
                    var branchs = this.report_options['branches'] ? this.report_options['branches'] : this.report_options['branch'];
                    const branch_ids = []
                    if (branchs) {
                        for (let i = 0; i < branchs.length; i++) {
                            if (branchs[i]['id'] != 'divider' && branchs[i]['selected'] == true) {
                                branch_ids.push(parseInt(branchs[i]['id']))
                            }
                        }
                    }
                    var self = this;
                    var departments = []
                    await self._rpc({
                        model: 'report.header',
                        method: "get_domain_department",
                        args: [branch_ids, self.odoo_context.model],
                    })
                    .then((res) => {
                        departments.push(...res);
                    });
                    if (branch_ids.length > 0) {
                        if ('department_ids' in self.report_options) {
                            fields['department_ids'] = {
                                label: _t('Phòng ban'),
                                modelName: 'hr.department',
                                domain: [['id', 'in', departments]],
                                value: self.report_options.department_ids.map(Number),
                            };
                        }
                    } else {
                        if ('department_ids' in self.report_options) {
                            fields['department_ids'] = {
                                label: _t('Phòng ban'),
                                modelName: 'hr.department',
                                domain: [['department_level', 'not in', [1, 2, 3]]],
                                value: self.report_options.department_ids.map(Number),
                            };
                        }
                    }

                    if (!_.isEmpty(fields)) {
                        self.CrmM2MFilters = new CrmM2MFilters(self, fields);
                        self.CrmM2MFilters.appendTo(self.$searchview_buttons.find('.js_department_m2m'));
                    }
                }
                if (this.report_options.top_selling) {
                    var fields = {};
                    if ('top_selling_ids' in this.report_options) {
                        fields['top_selling_ids'] = {
                            label: _t('Sản phẩm'),
                            modelName: 'product.template',
                            value: this.report_options.top_selling_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_top_selling_m2m'));
                    }
                }
                if (this.report_options.cus_type) {
                    var fields = {};
                    if ('cus_type_ids' in this.report_options) {
                        fields['cus_type_ids'] = {
                            label: _t('Loại khách hàng'),
                            modelName: 'vt.param',
                            domain: [['type', '=', 'customer']],
                            value: this.report_options.cus_type_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_cus_type_m2m'));
                    }
                }

                if (this.report_options.selling_step) {
                    var fields = {};
                    if ('selling_step_ids' in this.report_options) {
                        fields['selling_step_ids'] = {
                            label: _t('Bước bán hàng'),
                            modelName: 'vt.param',
                            domain: [['type', '=', 'phase']],
                            value: this.report_options.selling_step_ids.map(Number),
                        };
                    }
                    if (!_.isEmpty(fields)) {
                        this.CrmM2MFilters = new CrmM2MFilters(this, fields);

                        this.CrmM2MFilters.appendTo(this.$searchview_buttons.find('.js_selling_step_m2m'));
                    }
                }

                if (this.report_options.res_user) {
                    var fields = {};
                    var self = this;
                    if ('res_user_ids' in self.report_options) {
                        fields['res_user_ids'] = {
                            label: _t('Nhân viên'),
                            modelName: 'res.users',
                            domain: [['id', 'in', self.report_options.res_user_ids]],
                            value: self.report_options.selected_res_users.map(Number),
                        };
                    }

                    if (!_.isEmpty(fields)) {
                        self.CrmM2MFilters = new CrmM2MFilters(self, fields);
                        self.CrmM2MFilters.appendTo(self.$searchview_buttons.find('.js_res_user_m2m'));
                    }
                }
            }
        },

        update_cp: function () {
            var status = {
                cp_content: {
                    $buttons: this.$buttons,
                    $searchview_buttons: this.$searchview_buttons,
                    $pager: this.$pager,
                    $searchview: this.$searchview,
                },
            };
            this.updateControlPanel(status);
            this.$('.o_cp_top').attr("style", "display: inline !important");
        },
        reload: function () {
            var self = this;
            var parameters = this.report_options;
            if (!parameters)
                parameters = {};
            parameters['refresh_data'] = self.refresh;

            return self
                ._rpc({
                    model: this.report_model,
                    method: "get_report_informations",
                    args: [parameters],
                    context: this.odoo_context,
                })
                .then((res) => {
                    self.parse_reports_informations(res);
                    self.report = res;
                    self.render();
                    return self.update_cp();
                });
        },

        render: function () {
            this.render_searchview_buttons();
        },
        start: async function () {
            this.reload();
            core.bus.on("refresh_current_action", this, this.reload);
            await this._super(...arguments);
        }
    });
    core.action_registry.add('dashboard_header', CrmdashboardheaderWidget);
    return CrmdashboardheaderWidget;
});
