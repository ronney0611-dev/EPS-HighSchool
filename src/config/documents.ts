import logo from '../../public/images/logo.png';

export const images = {
    logo
}

export const documentsConfig =
{
    teacherclass: {
        informationCard: {
            id: 'first',
            image: '/images/info.jpg',
            name: 'بطاقة المعلومات الشخصية',
            description: 'أدخل معلوماتك الشخصية والمهنية مرة واحدة — الاسم، الثانوية، الولاية، المؤهلات — وستظهر تلقائياً في كل الوثائق التي تطبعها. لا حاجة لإعادة الكتابة في كل مرة.',
            files: {
                informationCard: {
                    id: 'بطاقة المعلومات الشخصية',
                    name: 'بطاقة المعلومات الشخصية',
                    description: "بطاقة المعلومات الشخصية الجاهزة للطباعة",
                    type: 'interactive',
                    component: 'informationCard',
                },
            }
        },
        jardCard: {
            id: 'first',
            name: 'بطاقة الجرد',
            image: '/images/calc.png',
            description: 'سجّل المعدات الرياضية والوسائل التعليمية الخاصة بمؤسستك. بطاقة جرد منظمة وجاهزة للطباعة في أي وقت، بدون أوراق مبعثرة أو جداول يدوية.',
            files: {
                materialsCalc: {
                    id: 's1',
                    name: 'بطاقة الجرد',
                    description: "سجل المعدات والوسائل الرياضية وطبعها مباشرة",
                    type: 'interactive',
                    component: 'materialsCalc',
                },
            }
        },
        barmaja: {
            id: 'first',
            name: 'البرمجة السنوية',
            image: '/images/barmaja.jpg',
            description: 'حمّل البرمجة السنوية الجاهزة والمطابقة للمنهاج الرسمي لكل مستوى — أولى، ثانية، ثالثة ثانوي — بنقرة واحدة..',
            files: {
                barmaja1: {
                    id: 's1',
                    name: "البرمجة السنوية الاولى ثانوي",
                    description: "حمّل البرمجة السنوية لمستوى أولى ثانوي جاهزة للطباعة",
                    type: 'static',
                    src: '/documents/barmaja/1.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                },
                barmaja2: {
                    id: 's2',
                    name: "البرمجة السنوية ثانية ثانوي",
                    description: "حمّل البرمجة السنوية لمستوى ثانية ثانوي جاهزة للطباعة",
                    type: 'static',
                    src: '/documents/barmaja/2.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                },
                barmaja3: {
                    id: 's3',
                    name: "البرمجة السنوية ثالثة ثانوي",
                    description: "حمّل البرمجة السنوية لمستوى ثالثة ثانوي جاهزة للطباعة",
                    type: 'static',
                    src: '/documents/barmaja/3.pdf',
                    thumbnail: '/documents/barmaja/barmaja.png'
                }
            },
        },
        planOfTheYear: {
            id: 'first',
            name: 'المخطط السنوي',
            image: '/images/plany.jpg',
            description: 'المخطط السنوي جاهز ومنسق وفق البرنامج الرسمي. حمّله مباشرة واطبعه — لا حاجة لإنشائه من الصفر كل سنة.',
            files: {
                mokhatat1: {
                    id: 's1',
                    name: 'المخطط السنوي',
                    description: "حمّل المخطط السنوي جاهزاً للطباعة",
                    type: 'static',
                    src: '/documents/plan/1.pdf',
                    thumbnail: '/images/plan.png'
                },
                mokhatat2: {
                    id: 's2',
                    name: "المخطط السنوي الثالثة ثانوي",
                    description: "حمّل المخطط السنوي لمستوى ثالثة ثانوي",
                    type: 'static',
                    src: '/documents/plan/2.pdf',
                    thumbnail: '/images/plan.png'
                },
            }
        },
        wahda: {
            id: 'first',
            name: 'الوحدة التعلمية',
            image: '/images/wihda.jpg',
            description: 'أنشئ وحداتك التعلمية بشكل تفاعلي —  بعد التقويم التشخيصي اختر النشاط وطبع الوحدة جاهزة بناء على مستويات الاقسام. كل شيء مرتبط بالمنهاج الرسمي تلقائياً.',
            files: {
                wahda1: {
                    id: 's1',
                    name: 'الوحدة التعلمية',
                    description: "أنشئ وحدتك التعلمية واطبعها مباشرة",
                    type: 'interactive',
                    component: 'wahda',
                },
            }
        },
    },
    teacherNote: {
        classPlan: {
            id: 'first',
            name: 'تفويج القسم',
            image: '/images/groupe4.png',
            description: ' اختر القسم وسنوزّع التلاميذ على مجموعات بشكل منظم واطبع بطاقة التفويج جاهزة. يعتمد على قائمة التلاميذ التي أدخلتها مسبقاً — لا إعادة كتابة.',
            files: {
                classPlan: {
                    id: 's1',
                    name: 'تفويج القسم',
                    description: "وزّع التلاميذ على المجموعات واطبع بطاقة التفويج",
                    type: 'interactive',
                    component: 'classPlan',
                },
            }
        },
        motaba3a: {
            id: 'second',
            name: 'بطاقة الحضور والمتابعة',
            image: '/images/7odorx.png',
            description: 'سجّل الحضور والغياب لكل قسم بسرعة، وتابع الحالات الخاصة والإعفاءات. البطاقة جاهزة للطباعة في أي وقت وتحتوي تلقائياً على أسماء تلاميذك.',
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
            name: 'التقويم التشخيصي / التحصيلي',
            image: '/images/ch.jpg',
            description: 'سجّل أداء التلاميذ في الأنشطة الفردية والجماعية — المؤشرات، النسب، المستويات النوعية — والمنصة تحسب كل شيء تلقائياً. بطاقة جاهزة للطباعة فور الانتهاء.',
            files: {
                taqwim: {
                    id: 'taqwim',
                    name: 'التقويم التشخيصي',
                    type: 'interactive',
                    component: 'taqwimTach'
                }
            },
        },
        takwinMostamir: {
            id: 'second',
            name: 'التقويم المستمر',
            image: '/images/m.jpg',
            description: 'تابع تطور كل تلميذ خلال الفصل الدراسي. سجّل الملاحظات والنقاط الدورية واحصل على تقرير المتابعة جاهزاً للطباعة بدون أي حسابات يدوية.',
            files: {
                taqwim: {
                    id: 'taqwim',
                    name: 'التقويم المستمر',
                    type: 'interactive',
                    component: 'taqwimMostamir'
                }
            },
        },
        takwini: {
            id: 'second',
            name: 'التقويم التكويني',
            image: '/images/t.jpg',
            description: 'قيّم تلاميذك أثناء التعلم وسجّل مدى تحكمهم في الكفاءات. المنصة تحسب تضع النقاط تلقائياً وتولّد بطاقة التقويم جاهزة للطباعة.',
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
            name: 'نقطة الاختبار',
            image: '/images/f.jpg',
            description: 'اختر القسم و المنصة تنقط و تحسب النقطة النهائية تلقائياً بناءً على البارام من المنهاج الرسمي. الجدول جاهز للطباعة في ثوانٍ.',
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