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

                    self.renderColumnChart(self.values);
                    self.renderColumnChart2(self.values);

                    self.renderDoughnutChart5(self.values);
                    self.renderDoughnutChart6(self.values);
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

        renderDoughnutChart5: function (data) {
            const ctx = this.$el.find('#pieChart5');
            const doughnutChart2 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C'],
                    datasets: [{
                        label: 'My First Dataset',
                        data: ['13', '43', '25'],
                        backgroundColor: [
                            '#F9A775',
                            '#C6CFD4',
                            '#AA8BC2',
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

        renderDoughnutChart6: function (data) {
            const ctx = this.$el.find('#pieChart6');
            const doughnutChart2 = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C'],
                    datasets: [{
                        label: 'My First Dataset',
                        data: ['13', '43', '25'],
                        backgroundColor: [
                            '#F9A775',
                            '#C6CFD4',
                            '#AA8BC2',
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

        renderColumnChart: function (data) {
            var self = this;
            const ctx = this.$el.find('#columnChart');
            const columnChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Công ty A', 'Công ty BB', 'Công ty C', 'Công ty D', 'Công ty E', 'Công ty F', 'Công ty G'],
                    datasets: [{
                        label: 'DS Sale',
                        data: [65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: ['#36A0DF'],
                        borderColor: ['#36A0DF'],
                        borderWidth: 1
                    }, {
                        label: 'DS Resale',
                        data: [56, 52, 40, 36, 40, 74, 60],
                        backgroundColor: ['#F78C8D'],
                        borderColor: ['#F78C8D'],
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 9,
                                padding: 30,
                            },

                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Doanh số (đồng)'
                            }
                        },
                    },

                },
            });
        },

        renderColumnChart2: function (data) {
            var self = this;
            const ctx = this.$el.find('#columnChart2');
            const columnChart2 = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022',
                             '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022',
                             '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022', '16/03/2022'],
                    datasets: [{
                        label: 'DS Sale',
                        data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],
                        backgroundColor: ['#FFD26A'],
                        borderColor: ['#FFD26A'],
                        borderWidth: 1
                    }, {
                        label: 'DS Resale',
                        data: [56, 52, 40, 36, 40, 74, 60, 56, 52, 40, 36, 40, 74, 60, 56, 52, 40, 36, 40, 74, 60],
                        backgroundColor: ['#84BE59'],
                        borderColor: ['#84BE59'],
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 9,
                                padding: 30,
                            },

                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            type: 'linear',
                            position: 'left',
                            title: {
                                display: true,
                                text: 'Doanh số (đồng)'
                            }
                        },
                    },

                },
            });
        },
    });
    core.action_registry.add('bc_trading', VtDashboardView);
    return VtDashboardView;
});
