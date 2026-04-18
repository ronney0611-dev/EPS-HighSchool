
export const documentsConfig =
{
    teacherclass: {
        informationCard: {
            id: 'first',
            image: '/images/information.png',
            name: 'بطاقة المعلومات الشخصية',
            description: 'نظام “بطاقة المعلومات الشخصية” يتيح للمعلم أو الطالب إدخال وعرض البيانات الأساسية بشكل منظم وسهل الوصول، مثل الاسم والمعلومات العامة ووسائل الاتصال، مما يساعد على إدارة المعلومات الشخصية داخل النظام التعليمي بكفاءة ووضوح.',
            files: {
                informationCard: {
                    id: 'بطاقة المعلومات الشخصية',
                    name: 'بطاقة المعلومات الشخصية',
                    description: "This is the first mokhatat document",
                    type: 'interactive',
                    component: 'informationCard',
                },
            }
        },
        jardCard: {
            id: 'first',
            name: 'بطاقة الجرد',
            image: '/images/calc.png',
            description: 'نظام “بطاقة الجرد” هو أداة تنظيم وإدارة تساعد المعلمين والطلاب على تتبّع المواد والمعدات والموارد الدراسية بشكل دقيق وفعّال، مما يسهل عملية الجرد والمتابعة اليومية ويضمن تنظيمًا أفضل داخل البيئة التعليمية.',
            files: {
                materialsCalc: {
                    id: 's1',
                    name: 'بطاقة الجرد',
                    description: "This is the first mokhatat document",
                    type: 'interactive',
                    component: 'materialsCalc',
                },
            }
        },
        timeCard: {
            id: 'first',
            name: 'استعمال الزمن',
            image: '/images/time.png',
            description: 'نظام مخصص لتنظيم وتوزيع الحصص الدراسية الخاصة بالمعلم بشكل دقيق ومنظم، يتيح عرض الجدول الأسبوعي أو اليومي بطريقة واضحة تساعد على تتبع أوقات التدريس، وتسهيل إدارة المهام التعليمية داخل المؤسسة بشكل فعال.',
            files: {
                mokhatat1: {
                    id: 's1',
                    name: 'استعمال الزمن',
                    description: "This is the first mokhatat document",
                    type: 'static',
                    src: '/documents/barmaja/1.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                },
            }
        },
        barmaja: {
            id: 'first',
            name: 'البرمجة السنوية',
            image: '/images/barmajax.png',
            description: '“البرمجة السنوية” يتيح للمعلم إعداد وتنظيم التخطيط السنوي للمقررات الدراسية بشكل منظم ودقيق، من خلال توزيع الدروس والوحدات على مدار السنة الدراسية، مما يساعد على تتبع التقدم وضمان إنجاز الأهداف التعليمية في الوقت المحدد.',
            files: {
                barmaja1: {
                    id: 's1',
                    name: "البرمجة السنوية الاولى ثانوي",
                    description: "بلمسة زر واحدة. حمل البرمجة السنوي الخاصة بمستوى الثالثة ثانوي",
                    type: 'static',
                    src: '/documents/barmaja/1.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                },
                barmaja2: {
                    id: 's2',
                    name: "البرمجة السنوية ثانية ثانوي",
                    description: "بلمسة زر واحدة. حمل البرمجة السنوي الخاصة بمستوى ثانية ثانوي",
                    type: 'static',
                    src: '/documents/barmaja/2.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                },
                barmaja3: {
                    id: 's3',
                    name: "البرمجة السنوية اولى ثانوي",
                    description: "بلمسة زر واحدة. حمل البرمجة السنوي الخاصة بمستوى الاولى ثانوي",
                    type: 'static',
                    src: '/documents/barmaja/3.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                }
            },
        },
        planOfTheYear: {
            id: 'first',
            name: 'المخطط السنوي',
            image: '/images/planx.png',
            description: 'نظام “المخطط السنوي” يساعد المعلم على إعداد خطة سنوية شاملة لتوزيع الدروس والوحدات الدراسية على مدار السنة، مما يضمن تنظيم العملية التعليمية بشكل متوازن وتتبع الأهداف التربوية وتحقيقها في الوقت المناسب.',
            files: {
                mokhatat1: {
                    id: 's1',
                    name: 'المخطط السنوي',
                    description: "بلمسة زر واحدة. حمل المخطط السنوي. الفصل الاول",
                    type: 'static',
                    src: '/documents/plan/1.pdf',
                    thumbnail: '/images/plan.png'
                },
                mokhatat2: {
                    id: 's2',
                    name: "المخطط السنوي الثالثة ثانوي",
                    description: "بلمسة زر واحدة. حمل المخطط السنوي لباقي الفصول",
                    type: 'static',
                    src: '/documents/plan/2.pdf',
                    thumbnail: '/images/plan.png'
                },
            }
        },
    },
    teacherNote: {
        classPlan: {
            id: 'first',
            name: 'تفويج القسم',
            image: '/images/groupe4.png',
            description: "نظام “تفويج القسم” يهدف إلى تنظيم تقسيم التلاميذ داخل الأقسام أو المجموعات الدراسية بشكل منظم وفعّال، مما يساعد المعلم على إدارة الحصص بسهولة وتحسين سير العملية التعليمية داخل الفصل.",
            files: {
                classPlan: {
                    id: 's1',
                    name: 'تفويج القسم',
                    description: "بلمسة زر واحدة. حمل المخطط السنوي. الفصل الاول",
                    type: 'interactive',
                    component: 'classPlan',
                },
            }
        },
        motaba3a: {
            id: 'second',
            name: 'بطاقة الحضور والمتابعة',
            image: '/images/7odorx.png',
            description: '"نظام “بطاقة الحضور والمتابعة” يتيح للمعلم تسجيل حضور وغياب التلاميذ بشكل يومي، مع متابعة انتظامهم وتوثيق الملاحظات التربوية، مما يساعد على مراقبة الانضباط الدراسي وتحسين متابعة أداء المتعلمين بشكل مستمر ومنظم."',
            files: {
                mostamir: {
                    id: 'noting',
                    name: 'بطاقة الحضور والمتابعة',
                    type: 'interactive',
                    component: 'mostamir',
                }
            },
        },
        bita9ata9wim: {
            id: 'second',
            name: 'التقويم التشخيصي',
            image: '/images/ta9wim.png',
            description: 'نظام “التقويم التشخيصي” يهدف إلى تقييم مستوى التلاميذ في بداية التعلم أو قبل درس معين، من أجل تحديد نقاط القوة والضعف لديهم، وتوجيه العملية التعليمية بشكل مناسب يساعد على تحسين التعلمات ومعالجة الصعوبات بشكل مبكر.',
            files: {
                taqwim: {
                    id: 'taqwim',
                    name: 'التقويم التشخيصي',
                    type: 'interactive',
                    component: 'taqwimTach'
                }
            },
        },
        takwini: {
            id: 'second',
            name: 'التقويم التكويني',
            image: '/images/testx.png',
            description: 'نظام “التقويم التكويني” يتيح للمعلم متابعة تقدم التلاميذ بشكل مستمر أثناء عملية التعلم، من خلال تقييمات دورية وأنشطة تعليمية تساعد على قياس مدى استيعابهم ',
            files: {
                taqwim: {
                    id: 'cbhh',
                    name: 'التقويم التكويني',
                    type: 'interactive',
                    component: 'taqwimTaqwini'
                }
            },
        },
        ta7sili: {
            id: 'second',
            name: 'التقويم التحصيلي',
            image: '/images/final.png',
            description: 'نظام “التقويم التحصيلي” يهدف إلى قياس مدى تحقيق التلاميذ للأهداف التعليمية في نهاية وحدة أو فصل دراسي، من خلال اختبارات أو أنشطة تقييمية شاملة تساعد على تحديد مستوى التحصيل الدراسي وتوثيق النتائج بشكل دقيق ومنظم.',
            files: {
                ta7sili: {
                    id: 'taqwim',
                    name: 'التقويم التحصيلي',
                    type: 'interactive',
                    component: 'taqwimTahsili'
                }
            },
        },
    }
}