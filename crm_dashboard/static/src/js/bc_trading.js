odoo.define('crm_dashboard.bc_trading', function (require) {
    "use strict";
    var core = require('web.core');
    var AbstractAction = require('web.AbstractAction');
    var QWeb = core.qweb;
    var CrmHeader = require('crm_dashboard.CrmdashboardheaderWidget');

    var VtDashboardView = CrmHeader.extend({

        events: _.extend({}, CrmHeader.prototype.events, {
            'click .leaves-left': 'leaves_left',
            'click #generate_payroll_pdf': function () {
                // this.generate_payroll_pdf("bar");
            },
            'click #generate_attendance_pdf': function () {
                // this.generate_payroll_pdf("pie")
            },
            'click .my_profile': 'action_my_profile',
        }),

        render: function () {

            var self = this;
            self.render_content_chart();
            this._super();
//            return dashboard
        },

        render_content_chart: function () {
            var self = this;
            if (self.report_action.tag == 'bc_trading') {
                self._rpc({
                    model: 'bc.trading',
                    method: 'get_detail_data',
                    args: [self.report_options],
                }, []).then(function (result) {
                    self.values = result;
                    var dashboard = QWeb.render('crm_dashboard.bc_trading', {
                        widget: self,
                    });
//                    $(".o_control_panel").addClass("o_hidden");
                    $(".o_content").addClass("o_hidden");
                    $(".o_cp_searchview").addClass("o_hidden");
                    $(".o_search_options").css({'width': '100%'});
//                    $(".o_cp_bottom").addClass("o_hidden");
                    $(".vt-dashboard").remove();
                    $(dashboard).appendTo(self.$el);

                    self.renderDoughnutChart1(self.values);
                    self.renderDoughnutChart2(self.values);
                    self.renderDoughnutChart3(self.values);
                    self.renderDoughnutChart4(self.values);
                });
            }
        },
        renderDoughnutChart1: function (data) {
            const ctx = this.$el.find('#pieChart1');
            const doughnutChart1 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C', 'Công ty D', 'Công ty E', 'Công ty F', 'Công ty G'],
                    datasets: [{
                        label: 'My First Dataset',
                        data: ['13', '43', '34', '22', '25', '34', '31'],
                        backgroundColor: [
                            '#84BE59',
                            '#36A0DF',
                            '#FFD26A',
                            '#F78C8D',
                            '#AA8BC2',
                            '#8ED9D9',
                            '#F9A775'
                        ],
                        hoverOffset: 0,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'rect',
                                padding: 25,
                                boxWidth: 9,
                            }
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },

        renderDoughnutChart2: function (data) {
            const ctx = this.$el.find('#pieChart2');
            const doughnutChart2 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C', 'Công ty D', 'Công ty E'],
                    datasets: [{
                        label: 'My First Dataset',
                        data: ['13', '43', '25', '34', '31'],
                        backgroundColor: [
                            '#84BE59',
                            '#F78C8D',
                            '#C6CFD4',
                            '#FF5B69',
                            '#ED5753'
                        ],
                        hoverOffset: 0,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'rect',
                                padding: 25,
                                boxWidth: 9,
                            }
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },

        renderDoughnutChart3: function (data) {
            const ctx = this.$el.find('#pieChart3');
            const doughnutChart3 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C', 'Công ty D', 'Công ty E'],
                    datasets: [{
                        label: 'My First Dataset',
                        data: ['13', '43', '25', '34', '31'],
                        backgroundColor: [
                            '#C4C4C4',
                        ],
                        hoverOffset: 0,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'rect',
                                padding: 25,
                                boxWidth: 9,
                            }
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },
        renderDoughnutChart4: function (data) {
            const ctx = this.$el.find('#pieChart4');
            const doughnutChart4 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C', 'Công ty D', 'Công ty E'],
                    datasets: [{
                        label: 'My First Dataset',
                        data: ['13', '43', '25', '34', '31'],
                        backgroundColor: [
                            '#C4C4C4',
                        ],
                        hoverOffset: 0,
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'left',
                            labels: {
                                usePointStyle: true,
                                pointStyle: 'rect',
                                padding: 25,
                                boxWidth: 9,
                            }
                        },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                },
            });
        },
    });
    core.action_registry.add('bc_trading', VtDashboardView);
    return VtDashboardView;
});
