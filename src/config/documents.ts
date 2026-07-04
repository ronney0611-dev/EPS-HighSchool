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
            levels: ['lycee', 'cem', 'primaire'],
            youtubeVideoId:'zTAuFOLi-qg',
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
            levels: ['lycee', 'cem', 'primaire'],
            youtubeVideoId: 'OfIeH32fPXI',
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
            levels: ['lycee', 'cem'],
            youtubeVideoId:'Lg7PtPkji8U',
            description: 'حمّل البرمجة السنوية الجاهزة والمطابقة للمنهاج الرسمي لكل مستوى — أولى، ثانية، ثالثة ثانوي — بنقرة واحدة..',
            files: {
                barmaja1: {
                    id: 's1',
                    name: 'البرمجة السنوية',
                    description: "أنشئ barmaja السنوي واطبعها مباشرة",
                    type: 'interactive',
                    component: { lycee: 'barmaja', cem: 'barmajaCem' },
                },
            },
        },
        mokhatat: {
            id: 'first',
            name: ' المخطط السنوي الابتدائي',
            image: '/images/wihda.jpg',
            levels: ['primaire'],
            youtubeVideoId: 'xx',
            description: 'أنشئ وحداتك التعلمية بشكل تفاعلي —  بعد التقويم التشخيصي اختر النشاط وطبع الوحدة جاهزة بناء على مستويات الاقسام. كل شيء مرتبط بالمنهاج الرسمي تلقائياً.',
            files: {
                mokhatat1: {
                    id: 's1',
                    name: 'المخطط السنوي',
                    description: "أنشئ المخطط السنوي واطبعها مباشرة",
                    type: 'interactive',
                    component: 'mokhatat',
                },
            }
        },
        planOfTheYear: {
            id: 'first',
            name: 'المخطط السنوي',
            image: '/images/plany.jpg',
            levels: ['lycee', 'cem'],
            youtubeVideoId: 'xx',
            description: 'المخطط السنوي جاهز ومنسق وفق البرنامج الرسمي. حمّله مباشرة واطبعه — لا حاجة لإنشائه من الصفر كل سنة.',
            files: {
                planOfYear1: {
                    id: 's1',
                    name: 'plan of the year',
                    description: "أنشئ التوزيع السنوي واطبعها مباشرة",
                    type: 'interactive',
                    component: { lycee: 'planOfYear', cem: 'planOfYearCem' },
                },
            }
        },
        tawzi3: {
            id: 'first',
            name: 'التوزيع السنوي',
            image: '/images/wihda.jpg',
            levels: ['primaire'],
            youtubeVideoId:'xx',
            description: 'أنشئ وحداتك التعلمية بشكل تفاعلي —  بعد التقويم التشخيصي اختر النشاط وطبع الوحدة جاهزة بناء على مستويات الاقسام. كل شيء مرتبط بالمنهاج الرسمي تلقائياً.',
            files: {
                tawzi31: {
                    id: 's1',
                    name: 'التوزيع السنوي',
                    description: "أنشئ التوزيع السنوي واطبعها مباشرة",
                    type: 'interactive',
                    component: 'tawzi3',
                },
            }
        },
        wahda: {
            id: 'first',
            name: 'الوحدة التعلمية',
            image: '/images/wihda.jpg',
            levels: ['lycee', 'cem'],
            youtubeVideoId:'SsCEbuVl2Xc',
            description: 'أنشئ وحداتك التعلمية بشكل تفاعلي —  بعد التقويم التشخيصي اختر النشاط وطبع الوحدة جاهزة بناء على مستويات الاقسام. كل شيء مرتبط بالمنهاج الرسمي تلقائياً.',
            files: {
                wahda1: {
                    id: 's1',
                    name: 'الوحدة التعلمية',
                    description: "أنشئ وحدتك التعلمية واطبعها مباشرة",
                    type: 'interactive',
                    component: { lycee: 'wahda', cem: 'wahdaCem' },
                },
            }
        },
        wahdaP: {
            id: 'first',
            name: 'المقاطع التعلمية',
            image: '/images/wihda.jpg',
            levels: ['primaire'],
            youtubeVideoId:'xx',
            description: 'أنشئ وحداتك التعلمية بشكل تفاعلي —  بعد التقويم التشخيصي اختر النشاط وطبع الوحدة جاهزة بناء على مستويات الاقسام. كل شيء مرتبط بالمنهاج الرسمي تلقائياً.',
            files: {
                wahda1: {
                    id: 's1',
                    name: 'المقاطع التعلمية',
                    description: "أنشئ مقاطعك التعلمية واطبعها مباشرة",
                    type: 'interactive',
                    component: { primaire: 'wahdaPrimaire' },
                },
            }
        },
        ficheNote: {
            id: 'first',
            image: '/images/info.jpg',
            name: 'الدفتر اليومي', 
            levels: ['primaire'],
            youtubeVideoId:'xx',
            description: 'أدخل معلوماتك الشخصية والمهنية مرة واحدة — الاسم، الثانوية، الولاية، المؤهلات — وستظهر تلقائياً في كل الوثائق التي تطبعها. لا حاجة لإعادة الكتابة في كل مرة.',
            files: {
                ficheNote: {
                    id: 'الدفتر اليومي',
                    name: 'الدفتر اليومي',
                    description: "الدفتر اليومي الجاهزة للطباعة",
                    type: 'interactive',
                    component: 'ficheNote',
                },
            }
        },
    },
    teacherNote: {
        classPlan: {
            id: 'first',
            name: 'تفويج القسم',
            image: '/images/groupe4.png',
            levels: ['lycee', 'cem'],
            youtubeVideoId:'f3Fwkts3hko',
            description: ' اختر القسم وسنوزّع التلاميذ على مجموعات بشكل منظم واطبع بطاقة التفويج جاهزة. يعتمد على قائمة التلاميذ التي أدخلتها مسبقاً — لا إعادة كتابة.',
            files: {
                classPlan: {
                    id: 's1',
                    name: 'تفويج القسم',
                    description: "وزّع التلاميذ على المجموعات واطبع بطاقة التفويج",
                    type: 'interactive',
                    component: { lycee: 'classPlan', cem: 'classPlan' },
                },
            }
        },
        baladiyat: {
            id: 'first',
            name: 'البلديات التربوية',
            image: '/images/groupe4.png',
            levels: ['primaire'],
            youtubeVideoId:'xx',
            description: ' اختر القسم وسنوزّع التلاميذ على مجموعات بشكل منظم واطبع بطاقة التفويج جاهزة. يعتمد على قائمة التلاميذ التي أدخلتها مسبقاً — لا إعادة كتابة.',
            files: {
                baladiyat: {
                    id: 's1',
                    name: 'البلديات التربوية',
                    description: "وزّع التلاميذ على المجموعات واطبع بطاقة البلديات",
                    type: 'interactive',
                    component: { primaire: 'baladiyat' },
                },
            }
        },
        motaba3a: {
            id: 'second',
            name: 'بطاقة الحضور والمتابعة',
            image: '/images/7odorx.png',
            levels: ['lycee', 'cem', 'primaire'],
            youtubeVideoId:'RVxNIGc1VOI',
            description: 'سجّل الحضور والغياب لكل قسم بسرعة، وتابع الحالات الخاصة والإعفاءات. البطاقة جاهزة للطباعة في أي وقت وتحتوي تلقائياً على أسماء تلاميذك.',
            files: {
                mostamir: {
                    id: 'noting',
                    name: 'بطاقة الحضور والمتابعة',
                    type: 'interactive',
                    component: { lycee: 'mostamir', cem: 'mostamir', primaire: 'mostamirPrimaire' },
                }
            },
        },
        bita9ata9wim: {
            id: 'second',
            name: 'التقويم التشخيصي / التحصيلي',
            image: '/images/ch.jpg',
            levels: ['lycee', 'cem', 'primaire'],
            youtubeVideoId:'R-TBJRDH0YM',
            description: 'سجّل أداء التلاميذ في الأنشطة الفردية والجماعية — المؤشرات، النسب، المستويات النوعية — والمنصة تحسب كل شيء تلقائياً. بطاقة جاهزة للطباعة فور الانتهاء.',
            files: {
                taqwim: {
                    id: 'taqwim',
                    name: 'التقويم التشخيصي',
                    type: 'interactive',
                    component: { lycee: 'taqwimTach', cem: 'taqwimTachCem', primaire: 'taqwimTachPrimaire' }
                }
            },
        },
        takwinMostamir: {
            id: 'second',
            name: 'التقويم المستمر',
            image: '/images/m.jpg',
            levels: ['lycee', 'cem', 'primaire'],
            youtubeVideoId:'i5Pqnv-F-Yw',
            description: 'تابع تطور كل تلميذ خلال الفصل الدراسي. سجّل الملاحظات والنقاط الدورية واحصل على تقرير المتابعة جاهزاً للطباعة بدون أي حسابات يدوية.',
            files: {
                taqwim: {
                    id: 'taqwim',
                    name: 'التقويم المستمر',
                    type: 'interactive',
                    component: { lycee: 'taqwimMostamir', cem: 'taqwimMostamir', primaire: 'taqwimMostamirPrimaire' }
                }
            },
        },
        takwini: {
            id: 'second',
            name: 'التقويم التكويني',
            image: '/images/t.jpg',
            levels: ['lycee', 'cem'],
            youtubeVideoId:'nSPQt3rYRwY',
            description: 'قيّم تلاميذك أثناء التعلم وسجّل مدى تحكمهم في الكفاءات. المنصة تحسب تضع النقاط تلقائياً وتولّد بطاقة التقويم جاهزة للطباعة.',
            files: {
                taqwim: {
                    id: 'cbhh',
                    name: 'التقويم التكويني',
                    type: 'interactive',
                    component: { lycee: 'taqwimTakwini', cem: 'taqwimTakwiniCem' }
                }
            },
        },
        ta7sili: {
            id: 'second',
            name: 'نقطة الاختبار',
            image: '/images/f.jpg',
            levels: ['lycee', 'cem'],
            youtubeVideoId:'DzmdUtiE5J0',
            description: 'اختر القسم و المنصة تنقط و تحسب النقطة النهائية تلقائياً بناءً على البارام من المنهاج الرسمي. الجدول جاهز للطباعة في ثوانٍ.',
            files: {
                ta7sili: {
                    id: 'taqwim',
                    name: 'التقويم التحصيلي',
                    type: 'interactive',
                    component: { lycee: 'taqwimTahsili', cem: 'taqwimTahsiliCem' }
                }
            },
        },
        disp: {
            id: 'first',
            image: '/images/info.jpg',
            name: '  قائمة الاعفاءات / الحالات الخاصة',
            levels: ['primaire'],
            youtubeVideoId:'xx',
            description: 'أدخل معلوماتك الشخصية والمهنية مرة واحدة — الاسم، الثانوية، الولاية، المؤهلات — وستظهر تلقائياً في كل الوثائق التي تطبعها. لا حاجة لإعادة الكتابة في كل مرة.',
            files: {
                disp: {
                    id: 'قائمة الاعفاءات',
                    name: 'قائمة الاعفاءات',
                    description: "قائمة الاعفاءات الجاهزة للطباعة",
                    type: 'interactive',
                    component: 'dispoCard',
                },
            }
        },
    }
}