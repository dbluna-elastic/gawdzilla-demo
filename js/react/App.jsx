/**
 * Main React App Component
 * 
 * Complete university website template with:
 * - Global Header (top utility bar)
 * - Main Navigation
 * - Hero Section
 * - Latest News Section
 * - Footer
 */

import { useContext, useEffect, useState } from 'react';
import { TemplateContext } from './context/TemplateContext.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import ScholarshipSearch from './components/ScholarshipSearch.jsx';
import AnalyticsDashboard from './components/AnalyticsDashboard.jsx';
import LoginModal from './components/LoginModal.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import CounselorDashboard from './components/CounselorDashboard.jsx';
import MentalHealthStaffPortal from './components/MentalHealthStaffPortal.jsx';
import FraudRecipientDetail from './components/FraudRecipientDetail.jsx';
import ClientOutcomeDetail from './components/ClientOutcomeDetail.jsx';
import OkMentalHealthPublicSections from './components/OkMentalHealthPublicSections.jsx';
import OkOjaPublicSections from './components/OkOjaPublicSections.jsx';
import SnapFraudPublicSections from './components/SnapFraudPublicSections.jsx';
import WyomingPublicSections from './components/WyomingPublicSections.jsx';
import GhostStudentsPublicSections from './components/GhostStudentsPublicSections.jsx';
import OjaStaffPortal from './components/OjaStaffPortal.jsx';
import SnapFraudStaffPortal from './components/SnapFraudStaffPortal.jsx';
import WyomingStaffPortal from './components/WyomingStaffPortal.jsx';
import GhostStudentsStaffPortal from './components/GhostStudentsStaffPortal.jsx';
import OjaYouthScorecard from './components/OjaYouthScorecard.jsx';
import OkCommerceCompanyDashboard from './components/OkCommerceCompanyDashboard.jsx';
import OkAgencyStaffDashboard from './components/OkAgencyStaffDashboard.jsx';
import OkAgencyBusinessScorecard from './components/OkAgencyBusinessScorecard.jsx';
import StateAgencyGrantsSearch from './components/StateAgencyGrantsSearch.jsx';
import TexasCollegeStaffPortal from './components/TexasCollegeStaffPortal.jsx';
import OuMetStaffPortal from './components/oumet/OuMetStaffPortal.jsx';
import OuMetResearcherPortal from './components/oumet/OuMetResearcherPortal.jsx';
import OuMetCatalogPanel from './components/oumet/OuMetCatalogPanel.jsx';
import BoosterDonorScorecard from './components/BoosterDonorScorecard.jsx';
import OkAgencyPortalHeader from './components/okagency/OkAgencyPortalHeader.jsx';
import OkAgencyFooter from './components/okagency/OkAgencyFooter.jsx';
import CivicPublicHeader from './components/civic/CivicPublicHeader.jsx';
import CivicServiceRow from './components/civic/CivicServiceRow.jsx';
import CivicPublicFooter from './components/civic/CivicPublicFooter.jsx';
import { getApm, setUserContext, clearUserContext } from '../modules/tracing.js';
import { isAthleticAdvancementTemplate } from '../config/athleticAdvancement.js';

function App() {
    const template = useContext(TemplateContext);
    const [activeSection, setActiveSection] = useState('home'); // 'home', 'search', 'analytics', 'student-dashboard', 'counselor-dashboard'
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [userRole, setUserRole] = useState(null); // 'student' | 'counselor' | null
    const [campusId, setCampusId] = useState(null); // Store campus ID from login
    const [fraudRecipientId, setFraudRecipientId] = useState(null);
    const [clinicalClientId, setClinicalClientId] = useState(null);
    const [okagencyBusinessId, setOkagencyBusinessId] = useState(null);
    const [boosterDonorId, setBoosterDonorId] = useState(null);
    const [ojaYouthId, setOjaYouthId] = useState(null);

    useEffect(() => {
        console.log('⚛️ React App mounted with template:', template?.name);
    }, [template]);

    // Track route changes for RUM
    useEffect(() => {
        const apm = getApm();
        if (apm && activeSection) {
            const transaction = apm.startTransaction?.(`Route: ${activeSection}`, 'route-change');
            if (transaction && typeof transaction.addLabels === 'function') {
                transaction.addLabels({
                    'route.name': activeSection,
                    'route.type': activeSection.includes('dashboard') ? 'dashboard' : 'page',
                });
            }
            if (transaction && typeof transaction.end === 'function') {
                setTimeout(() => transaction.end(), 100);
            }
        }
    }, [activeSection]);

    const handleLogin = (campusId, password) => {
        const apm = getApm();
        
        if (password === 'test') {
            setUserRole('student');
            setCampusId(campusId || 'student');
            setActiveSection(
                template?.id === 'okagency'
                    ? 'commerce-dashboard'
                    : template?.id === 'oumet'
                    ? 'oumet-researcher-dashboard'
                    : 'student-dashboard',
            );
            setShowLoginModal(false);
            
            // Set user context for RUM
            if (apm) {
                setUserContext({
                    id: campusId || 'student',
                    username: campusId || 'student',
                    role: 'student',
                });
                
                // Track login event
                if (typeof apm.addLabels === 'function') {
                    apm.addLabels({
                        'user.action': 'login',
                        'user.role': 'student',
                    });
                }
            }
        } else if (password === 'staff') {
            setUserRole('counselor');
            setCampusId(campusId || 'counselor');
            setActiveSection('counselor-dashboard');
            setShowLoginModal(false);
            
            // Set user context for RUM
            if (apm) {
                setUserContext({
                    id: campusId || 'counselor',
                    username: campusId || 'counselor',
                    role: 'counselor',
                });
                
                // Track login event
                if (typeof apm.addLabels === 'function') {
                    apm.addLabels({
                        'user.action': 'login',
                        'user.role': 'counselor',
                    });
                }
            }
        }
    };

    const handleLogout = () => {
        const apm = getApm();
        
        // Clear user context for RUM
        if (apm) {
            clearUserContext();
            if (typeof apm.addLabels === 'function') {
                apm.addLabels({
                    'user.action': 'logout',
                });
            }
        }
        
        setUserRole(null);
        setCampusId(null);
        setOkagencyBusinessId(null);
        setBoosterDonorId(null);
        setFraudRecipientId(null);
        setClinicalClientId(null);
        setActiveSection('home');
    };

    const handleDonorClick = (donorId) => {
        setBoosterDonorId(donorId);
        setActiveSection('booster-donor-scorecard');
    };

    if (!template) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-600">Loading template...</p>
            </div>
        );
    }

    // News items - use template-specific news if available, otherwise use defaults
    const newsItems = template.news || [
        {
            category: 'Groundbreaking Research',
            title: 'University Scientists Make Breakthrough Discovery',
            description: 'Our research team has achieved a major milestone in sustainable energy solutions.',
            image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
        },
        {
            category: 'Student Success',
            title: 'Graduates Achieve 95% Employment Rate',
            description: 'This year\'s graduating class has set a new record for post-graduation employment.',
            image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
        },
        {
            category: 'Campus Life',
            title: 'New Student Center Opens This Fall',
            description: 'State-of-the-art facility provides modern spaces for student collaboration and learning.',
            image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
        },
    ];

    // Render different sections based on activeSection
    if (activeSection === 'commerce-dashboard') {
        return <OkCommerceCompanyDashboard onLogout={handleLogout} campusId={campusId} />;
    }

    if (activeSection === 'oumet-researcher-dashboard') {
        return <OuMetResearcherPortal onLogout={handleLogout} />;
    }

    if (activeSection === 'student-dashboard') {
        return <StudentDashboard onLogout={handleLogout} campusId={campusId} />;
    }

    if (activeSection === 'fraud-recipient-detail') {
        return (
            <FraudRecipientDetail
                medicaidRecipientId={fraudRecipientId}
                onBack={() => {
                    setFraudRecipientId(null);
                    setActiveSection('counselor-dashboard');
                }}
                onLogout={handleLogout}
            />
        );
    }

    if (activeSection === 'client-outcome-detail' && template?.id === 'okmentalhealth') {
        return (
            <ClientOutcomeDetail
                clientId={clinicalClientId}
                onBack={() => {
                    setClinicalClientId(null);
                    setActiveSection('counselor-dashboard');
                }}
                onLogout={handleLogout}
            />
        );
    }

    if (activeSection === 'okagency-business-scorecard' && template?.id === 'okagency') {
        return (
            <OkAgencyBusinessScorecard
                businessId={okagencyBusinessId}
                campusId={campusId}
                onBack={() => {
                    setOkagencyBusinessId(null);
                    setActiveSection('counselor-dashboard');
                }}
                onLogout={handleLogout}
            />
        );
    }

    if (activeSection === 'oja-youth-scorecard' && template?.id === 'okoja') {
        return (
            <OjaYouthScorecard
                youthId={ojaYouthId}
                onBack={() => {
                    setOjaYouthId(null);
                    setActiveSection('counselor-dashboard');
                }}
                onLogout={handleLogout}
            />
        );
    }

    if (activeSection === 'booster-donor-scorecard' && isAthleticAdvancementTemplate(template)) {
        return (
            <BoosterDonorScorecard
                donorId={boosterDonorId}
                onBack={() => {
                    setBoosterDonorId(null);
                    setActiveSection('counselor-dashboard');
                }}
                onLogout={handleLogout}
                onDonorClick={handleDonorClick}
            />
        );
    }

    if (activeSection === 'counselor-dashboard') {
        if (isAthleticAdvancementTemplate(template)) {
            return (
                <TexasCollegeStaffPortal
                    onLogout={handleLogout}
                    onDonorClick={handleDonorClick}
                />
            );
        }
        if (template?.id === 'oumet') {
            return <OuMetStaffPortal onLogout={handleLogout} />;
        }
        if (template?.id === 'okoja') {
            return (
                <OjaStaffPortal
                    onLogout={handleLogout}
                    onYouthClick={(id) => {
                        setOjaYouthId(id);
                        setActiveSection('oja-youth-scorecard');
                    }}
                />
            );
        }
        if (template?.id === 'snapfraud') {
            return <SnapFraudStaffPortal onLogout={handleLogout} />;
        }
        if (template?.id === 'ghoststudents') {
            return <GhostStudentsStaffPortal onLogout={handleLogout} />;
        }
        if (template?.id === 'wyoming') {
            return <WyomingStaffPortal onLogout={handleLogout} />;
        }
        if (template?.id === 'okmentalhealth') {
            return (
                <MentalHealthStaffPortal
                    onLogout={handleLogout}
                    onRecipientClick={(id) => {
                        setFraudRecipientId(id);
                        setActiveSection('fraud-recipient-detail');
                    }}
                    onClientClick={(id) => {
                        setClinicalClientId(id);
                        setActiveSection('client-outcome-detail');
                    }}
                    onOpenGrantsSearch={() => setActiveSection('grants-search')}
                />
            );
        }
        if (template?.id === 'okagency') {
            return (
                <OkAgencyStaffDashboard
                    onLogout={handleLogout}
                    campusId={campusId}
                    onBusinessClick={(id) => {
                        setOkagencyBusinessId(id);
                        setActiveSection('okagency-business-scorecard');
                    }}
                />
            );
        }
        return <CounselorDashboard onLogout={handleLogout} />;
    }

    if (activeSection === 'search') {
        return (
            <div className="w-full min-h-screen bg-white">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between h-20">
                            <button
                                onClick={() => setActiveSection('home')}
                                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                                {template.branding?.institutionName ?? 'Portal'}
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveSection('home')}
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => setActiveSection('analytics')}
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Analytics
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                <ScholarshipSearch />
                <ChatWidget floating={true} />
            </div>
        );
    }

    if (activeSection === 'analytics') {
        return (
            <div className="w-full min-h-screen bg-white">
                {/* Navigation */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between h-20">
                            <button
                                onClick={() => setActiveSection('home')}
                                className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                                {template.branding?.institutionName ?? 'Portal'}
                            </button>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveSection('home')}
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Home
                                </button>
                                <button
                                    onClick={() => setActiveSection('search')}
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    Search Scholarships
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
                <AnalyticsDashboard />
                <ChatWidget floating={true} />
            </div>
        );
    }

    // Oklahoma agency–style layout (okagency, okmentalhealth): overlay header, hero, blue bar, promo bar, white main
    const isAgencyOverlayLayout = ['okagency', 'okmentalhealth', 'dot', 'okoja', 'snapfraud', 'wyoming', 'ghoststudents'].includes(template?.id);
    const primaryColor = template?.colors?.primary || '#5D5FEF';
    const secondaryColor = template?.colors?.secondary || '#2E7D32';
    const charcoalColor = template?.colors?.charcoal || '#1e293b';

    if (isAgencyOverlayLayout && template?.id === 'okmentalhealth' && activeSection === 'grants-search') {
        return (
            <div className="w-full min-h-screen bg-slate-50" style={{ fontFamily: template?.typography?.fontFamily }}>
                <a
                    href="#grants-search-main"
                    className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:shadow-lg"
                >
                    Skip to grant search
                </a>
                <OkAgencyPortalHeader position="fixed" onLoginClick={() => setShowLoginModal(true)} />
                <StateAgencyGrantsSearch />
                <OkAgencyFooter />
                <ChatWidget floating={true} />
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
            </div>
        );
    }

    if (isAgencyOverlayLayout && template?.id === 'okagency') {
        return (
            <div className="w-full min-h-screen bg-slate-50" style={{ fontFamily: template?.typography?.fontFamily }}>
                <a
                    href="#grants-search-main"
                    className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:block focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:shadow-lg"
                >
                    Skip to grant search
                </a>
                <OkAgencyPortalHeader position="fixed" onLoginClick={() => setShowLoginModal(true)} />

                <StateAgencyGrantsSearch />

                <OkAgencyFooter />

                <ChatWidget floating={true} />
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
            </div>
        );
    }

    if (isAgencyOverlayLayout) {
        const dotLanding = template?.content?.dotLanding || {};
        const featuredBanner = dotLanding.featuredBanner;
        const quickTiles = Array.isArray(dotLanding.quickTiles) ? dotLanding.quickTiles : [];
        const spotlight = dotLanding.spotlight;
        const headingFont = template?.typography?.headingFontFamily || template?.typography?.fontFamily;
        const civicServiceTiles =
            template?.id === 'dot'
                ? quickTiles
                : template?.id === 'okmentalhealth'
                    ? (template.content?.crisisLanding?.tiles || [])
                    : (template.content?.programsLanding?.tiles || []);

        const handleCivicTileClick = (tile, e) => {
            if (tile.href === '#staff-login') {
                e.preventDefault();
                setShowLoginModal(true);
            }
            if (template?.id === 'okmentalhealth' && (tile.href === '#programs' || tile.href === '#grants-search')) {
                e.preventDefault();
                setActiveSection('grants-search');
            }
        };

        const primaryCta = template.hero?.ctaButtons?.primary || template.content?.ctaText || 'Explore services';
        const secondaryCta = template.hero?.ctaButtons?.secondary || template.content?.ctaSecondary || 'Staff login';

        return (
            <div className="w-full min-h-screen bg-white text-[#1b1b1b]" style={{ fontFamily: template?.typography?.fontFamily }}>
                <CivicPublicHeader
                    onLoginClick={() => setShowLoginModal(true)}
                    skipHref={template?.id === 'dot' ? '#dot-main-content' : '#civic-main'}
                />

                {/* USWDS / NIH-style hero — brand-first, full-bleed photo, primary wash */}
                <section className="relative flex min-h-[420px] flex-col justify-end pb-16 text-white md:min-h-[520px] md:pb-20">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${template.hero?.backgroundImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80'})`,
                        }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(105deg, ${primaryColor}f2 0%, ${primaryColor}cc 42%, rgba(27,27,27,0.55) 100%)`,
                        }}
                    />
                    <div className="relative z-10 mx-auto w-full max-w-[64rem] px-4 py-10 md:px-8 md:py-14">
                        <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-white/90">
                            {template.branding?.institutionName}
                        </p>
                        <h1
                            className="mb-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-[3.25rem]"
                            style={{ fontFamily: headingFont }}
                        >
                            {template.hero?.mainHeading ?? template.content?.heroTitle ?? 'Building Businesses and Communities'}
                        </h1>
                        <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/95 md:text-xl">
                            {template.hero?.subHeading ?? template.content?.heroSubtitle ?? 'Learn more about what makes Oklahoma the land of opportunity.'}
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <a
                                href="#civic-main"
                                className="inline-flex items-center rounded px-6 py-3 text-sm font-bold text-[#1b1b1b] hover:brightness-95"
                                style={{ backgroundColor: '#face00' }}
                            >
                                {primaryCta}
                            </a>
                            <button
                                type="button"
                                onClick={() => setShowLoginModal(true)}
                                className="inline-flex items-center rounded border-2 border-white px-6 py-3 text-sm font-bold text-white hover:bg-white hover:text-[#1b1b1b]"
                            >
                                {secondaryCta}
                            </button>
                        </div>
                    </div>
                </section>

                <CivicServiceRow
                    tiles={civicServiceTiles}
                    onTileClick={handleCivicTileClick}
                    sectionId={template?.id === 'okmentalhealth' ? 'crisis' : 'programs'}
                />

                {template?.id === 'dot' && featuredBanner?.title && (
                    <a
                        href={featuredBanner.href || '#'}
                        className="block w-full border-y border-[#dfe1e2] bg-[#f0f0f0] py-6 text-left transition-colors hover:bg-[#e6e6e6]"
                    >
                        <div className="mx-auto flex max-w-[64rem] flex-col gap-2 px-4 md:flex-row md:items-center md:justify-between md:px-8">
                            <div>
                                {featuredBanner.eyebrow && (
                                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#565c65]">
                                        {featuredBanner.eyebrow}
                                    </p>
                                )}
                                <h2
                                    className="text-xl font-bold text-[#1b1b1b] md:text-2xl"
                                    style={{ fontFamily: headingFont }}
                                >
                                    {featuredBanner.title}
                                </h2>
                                {featuredBanner.subtitle && (
                                    <p className="mt-1 max-w-3xl text-sm text-[#565c65] md:text-base">{featuredBanner.subtitle}</p>
                                )}
                            </div>
                            {featuredBanner.linkText && (
                                <span
                                    className="shrink-0 text-sm font-bold md:text-base"
                                    style={{ color: primaryColor }}
                                >
                                    {featuredBanner.linkText} →
                                </span>
                            )}
                        </div>
                    </a>
                )}

                {template.content?.promoBar && (
                    <div
                        className="border-y border-black/10 px-4 py-3 text-center text-sm font-bold text-white md:px-8"
                        style={{ backgroundColor: secondaryColor }}
                        role="region"
                        aria-label="Important notice"
                    >
                        <a href={template.content.promoBar?.href || '#'} className="hover:underline">
                            {template.content.promoBar?.text ?? ''}
                        </a>
                    </div>
                )}

                {template?.id === 'okoja' && (
                    <OkOjaPublicSections onStaffLoginClick={() => setShowLoginModal(true)} />
                )}

                {template?.id === 'snapfraud' && (
                    <SnapFraudPublicSections onStaffLoginClick={() => setShowLoginModal(true)} />
                )}

                {template?.id === 'ghoststudents' && (
                    <GhostStudentsPublicSections onStaffLoginClick={() => setShowLoginModal(true)} />
                )}

                {template?.id === 'wyoming' && (
                    <WyomingPublicSections onStaffLoginClick={() => setShowLoginModal(true)} />
                )}

                {template?.id === 'okmentalhealth' && (
                    <OkMentalHealthPublicSections
                        onStaffLoginClick={() => setShowLoginModal(true)}
                        onOpenGrantsSearch={() => setActiveSection('grants-search')}
                    />
                )}

                {/* DOT: safety / mission spotlight */}
                {template?.id === 'dot' && spotlight?.title && (
                    <section className="border-b border-[#dfe1e2] bg-[#1b1b1b] py-14 text-white md:py-16">
                        <div className="mx-auto max-w-[64rem] px-4 text-left md:px-8 md:text-center">
                            <h2
                                className="text-2xl font-bold md:text-3xl"
                                style={{ fontFamily: headingFont }}
                            >
                                {spotlight.title}
                            </h2>
                            {spotlight.body && (
                                <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90 md:text-lg">
                                    {spotlight.body}
                                </p>
                            )}
                            {spotlight.linkText && (
                                <a
                                    href={spotlight.href || '#'}
                                    className="mt-6 inline-block rounded border-2 border-white px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-[#1b1b1b]"
                                >
                                    {spotlight.linkText}
                                </a>
                            )}
                        </div>
                    </section>
                )}

                <main id={template?.id === 'dot' ? 'dot-main-content' : 'civic-main'} className="bg-[#f0f0f0] py-16">
                    <div className="mx-auto max-w-[64rem] px-4 md:px-8">
                        <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-[#565c65]">
                            {template.content?.mainTagline ?? 'A GLOBAL VISION WITH A LOCAL FOCUS'}
                        </p>
                        <h2
                            className="mb-10 text-3xl font-bold text-[#1b1b1b] md:text-4xl"
                            style={{ fontFamily: headingFont, color: charcoalColor }}
                        >
                            {template.content?.mainHeading ?? "North America's Central Location for Business"}
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {newsItems.map((item, index) => (
                                <article key={index} className="flex flex-col overflow-hidden rounded border border-[#dfe1e2] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                                    <div className="aspect-[16/9] overflow-hidden">
                                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <span className="mb-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: primaryColor }}>
                                            {item.category}
                                        </span>
                                        <h3 className="mb-3 text-xl font-bold" style={{ fontFamily: headingFont, color: charcoalColor }}>{item.title}</h3>
                                        <p className="mb-4 flex-1 text-[#565c65]">{item.description}</p>
                                        <a href="#" className="inline-flex items-center font-bold hover:underline" style={{ color: primaryColor }}>
                                            Read more
                                        </a>
                                    </div>
                                </article>
                            ))}
                        </div>
                        {template?.id === 'okmentalhealth' && (
                            <div className="mt-12">
                                <button
                                    type="button"
                                    onClick={() => setActiveSection('grants-search')}
                                    className="inline-flex items-center gap-2 rounded px-6 py-3 text-sm font-bold text-white hover:brightness-110"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Search behavioral health grants
                                </button>
                            </div>
                        )}
                    </div>
                </main>

                <CivicPublicFooter />

                {template?.chatEnabled !== false && <ChatWidget floating={true} />}
                <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-white">
            {/* 1. Global Header (Top Utility Bar) */}
            <header className="bg-[#1a2332] text-white py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex justify-end items-center gap-4">
                        {/* Login Button with Pulsing Animation */}
                        <div className="relative">
                            {/* Pulsing ring effect */}
                            <div 
                                className="absolute inset-0 rounded chatbot-pulse-ring opacity-50"
                                style={{
                                    backgroundColor: template?.colors?.primary || '#5D5FEF',
                                }}
                            ></div>
                            <button 
                                onClick={() => setShowLoginModal(true)}
                                className="relative px-4 py-1.5 text-sm font-medium hover:opacity-80 transition-opacity chatbot-pulse-button"
                            >
                                Login
                            </button>
                        </div>
                        
                        {/* Globe Icon */}
                        <button className="p-1.5 hover:opacity-80 transition-opacity">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. Main Navigation Row */}
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center">
                            <img
                                src={template.branding?.logo ?? ''}
                                alt={template.branding?.institutionName ?? 'Portal'}
                                className="h-12 w-auto"
                                onError={(e) => {
                                    // Fallback to text if image doesn't load
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                            <span className="text-xl font-bold text-gray-900 hidden">
                                {template.branding?.institutionName ?? 'Portal'}
                            </span>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <button
                                onClick={() => setActiveSection('home')}
                                className={`font-medium transition-colors ${
                                    activeSection === 'home'
                                        ? 'text-blue-600'
                                        : 'text-gray-900 hover:text-blue-600'
                                }`}
                            >
                                Home
                            </button>
                            {!template.navigation?.hideScholarshipNav && (
                                <>
                                    <button
                                        onClick={() => setActiveSection('search')}
                                        className={`font-medium transition-colors ${
                                            activeSection === 'search'
                                                ? 'text-blue-600'
                                                : 'text-gray-900 hover:text-blue-600'
                                        }`}
                                    >
                                        Search Scholarships
                                    </button>
                                    <button
                                        onClick={() => setActiveSection('analytics')}
                                        className={`font-medium transition-colors ${
                                            activeSection === 'analytics'
                                                ? 'text-blue-600'
                                                : 'text-gray-900 hover:text-blue-600'
                                        }`}
                                    >
                                        Analytics
                                    </button>
                                </>
                            )}
                            {template.navigation?.links?.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    className="text-gray-900 font-medium hover:text-[var(--primary-color)] transition-colors"
                                    style={{ color: '#1a2332' }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center gap-4">
                            <button className="md:hidden p-2 text-gray-900">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 3. Hero Section */}
            <section
                className="relative h-[600px] flex items-center justify-center text-white"
                style={{
                    backgroundImage: `linear-gradient(rgba(26, 35, 50, 0.65), rgba(26, 35, 50, 0.65)), url(${template.hero?.backgroundImage || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&q=80'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1
                        className="text-6xl md:text-7xl font-bold mb-6 tracking-wider"
                        style={{
                            fontFamily: 'var(--serif-font)',
                            letterSpacing: '0.1em',
                        }}
                    >
                        {template.hero?.mainHeading || 'THE STATE WAY'}
                    </h1>
                    <p className="text-xl md:text-2xl mb-10 font-medium">
                        {template.hero?.subHeading || 'Moving Forward. Together.'}
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            type="button"
                            onClick={() => {
                                if (template?.id === 'oumet') {
                                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    setShowLoginModal(true);
                                }
                            }}
                            className="px-8 py-3 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg"
                            style={{ backgroundColor: template.colors?.primary || '#5D5FEF' }}
                        >
                            {template.hero?.ctaButtons?.primary || 'Apply Now'}
                        </button>
                        {template.hero?.ctaButtons?.secondary && (
                            <button
                                type="button"
                                className="px-8 py-3 rounded-full font-semibold text-lg bg-white text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
                            >
                                {template.hero.ctaButtons.secondary}
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* Promo bar (template-driven, e.g. okagency) */}
            {template.content?.promoBar && (
                <a
                    href={template.content.promoBar?.href || '#'}
                    className="block w-full py-4 text-center text-white font-semibold hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: template.colors?.secondary || '#2E7D32' }}
                >
                    {template.content.promoBar?.text ?? ''}
                </a>
            )}

            {template?.id === 'oumet' && <OuMetCatalogPanel />}

            {/* 4. Latest News Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2
                        className="text-4xl md:text-5xl font-bold text-center mb-12"
                        style={{
                            fontFamily: 'var(--serif-font)',
                            color: template.colors?.primary || '#5D5FEF',
                        }}
                    >
                        Latest News
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {newsItems.map((item, index) => (
                            <article
                                key={index}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Image */}
                                <div className="aspect-video overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                
                                {/* Content */}
                                <div className="p-6">
                                    <span
                                        className="text-sm font-semibold uppercase tracking-wide mb-2 block"
                                        style={{ color: template.colors?.primary || '#5D5FEF' }}
                                    >
                                        {item.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {item.description}
                                    </p>
                                    <a
                                        href="#"
                                        className="font-bold inline-flex items-center gap-1 hover:gap-2 transition-all"
                                        style={{ color: template.colors?.primary || '#5D5FEF' }}
                                    >
                                        Read More →
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. Footer */}
            <footer className="bg-[#1a2332] text-white">
                {/* Divider Line */}
                <div className="border-t border-gray-700"></div>
                
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* Column 1: University Info */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">
                                {template.branding?.institutionName ?? 'Portal'}
                            </h3>
                            <p className="text-gray-300 text-sm mb-2">
                                {template.footer?.address ?? '123 University Avenue, City, State 12345'}
                            </p>
                            <p className="text-gray-300 text-sm">
                                {template.footer?.phone ?? '(555) 123-4567'}
                            </p>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                {template.footer?.quickLinks?.map((link, index) => (
                                    <li key={index}>
                                        <a
                                            href={link.href}
                                            className="text-gray-300 text-sm hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 3: Connect */}
                        <div>
                            <h3 className="font-bold text-lg mb-4">Connect</h3>
                            <div className="flex gap-4">
                                {template.footer?.socialMedia?.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        className="text-gray-300 hover:text-white transition-colors font-semibold"
                                        aria-label={social.label}
                                    >
                                        {social.platform}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <p className="text-center text-gray-400 text-sm">
                            © 2026 {template.branding?.institutionName ?? 'Portal'}. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Chat Widget - Floating */}
            <ChatWidget floating={true} />

            {/* Login Modal */}
            <LoginModal 
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onLogin={handleLogin}
            />
        </div>
    );
}

export default App;
