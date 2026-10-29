# Graph Report - Fili-QuizMo  (2026-10-29)

## Corpus Check
- Corpus is ~9,784 words - fits in a single context window. You may not need a graph.

## Summary
- 282 nodes · 500 edges · 21 communities (18 shown, 3 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 1% AMBIGUOUS · INFERRED: 48 edges (avg confidence: 0.81)
- Token cost: 16,930 input · 12,250 output

## Community Hubs (Navigation)
- Auth Pages and Forms
- Build Config and Dependencies
- Static Landing Page
- Teacher Dashboard UI
- Public Pages and Navigation
- TypeScript Configuration
- True-False Quiz Screen
- Supabase Auth and Routing
- Brand and Logo Assets
- Fill-in-the-Blanks Quiz UI
- Home Screen and Menu
- Role Selection Screen
- Developer Team Photos
- Leadership Portrait Asset
- Root Layout and Fonts
- Default Avatar Asset
- School Topic Imagery
- Next.js Agent Rules
- Starter Icon Assets
- PostCSS Configuration
- Framework Logo Assets

## God Nodes (most connected - your core abstractions)
1. `next` - 20 edges
2. `react` - 17 edges
3. `compilerOptions` - 16 edges
4. `Button()` - 15 edges
5. `createClient()` - 14 edges
6. `True or False Quiz Screen` - 12 edges
7. `FormField()` - 11 edges
8. `Fill in the Blanks Quiz Screen` - 11 edges
9. `AdminDashboardContent()` - 10 edges
10. `TeacherDashboardContent()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `public/assets README (title stub)` --semantically_similar_to--> `Fili-QuizMo Project Overview`  [INFERRED] [semantically similar]
  public/assets/README.md → README.md
- `Fili-QuizMo Static Landing Page` --semantically_similar_to--> `Application Route Map`  [INFERRED] [semantically similar]
  public/assets/landingpage.html → README.md
- `Teacher Login Section` --semantically_similar_to--> `Supabase Authentication Setup`  [INFERRED] [semantically similar]
  public/assets/landingpage.html → README.md
- `Admin Login Section` --semantically_similar_to--> `Admin TOTP multi-factor authentication (AAL2)`  [INFERRED] [semantically similar]
  public/assets/landingpage.html → README.md
- `APK Download / Install Instructions` --semantically_similar_to--> `Android APK distribution`  [INFERRED] [semantically similar]
  public/assets/landingpage.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Supabase admin authentication and authorization flow** — readme_supabase_auth, readme_app_metadata_role, readme_admin_totp_mfa, readme_row_level_security, readme_server_authorization_boundary, public_assets_landingpage_admin_login [INFERRED 0.85]
- **Role-split teacher/admin screens on the static landing page** — public_assets_landingpage_teacher_login, public_assets_landingpage_admin_login, public_assets_landingpage_teacher_dashboard, public_assets_landingpage_admin_dashboard, public_assets_landingpage_dbadd [EXTRACTED 1.00]
- **Title Screen Menu Flow** — public_assets_home_screen_title_logo, public_assets_home_screen_student_role_button, public_assets_home_screen_join_button, public_assets_home_screen_about_button, public_assets_home_screen_quit_button [INFERRED 0.85]
- **Cohesive Retro Pixel Theme** — public_assets_home_screen_pixel_art_style, public_assets_home_screen_night_sky_background, public_assets_home_screen_eagle_mascot, public_assets_home_screen_title_logo [EXTRACTED 1.00]
- **Role Choice Interaction Flow** — public_assets_role_select_role_selection_screen, public_assets_role_select_select_role_card, public_assets_role_select_student_button, public_assets_role_select_teacher_button [EXTRACTED 1.00]
- **Fill-in-the-Blank Answering Flow** — public_assets_fill_in_the_blanks_tanong_question_card, public_assets_fill_in_the_blanks_answer_input, public_assets_fill_in_the_blanks_answer_choices, public_assets_fill_in_the_blanks_clear_button, public_assets_fill_in_the_blanks_next_button [INFERRED 0.85]
- **Quiz HUD Cluster** — public_assets_fill_in_the_blanks_close_button, public_assets_fill_in_the_blanks_question_progress, public_assets_fill_in_the_blanks_countdown_timer [EXTRACTED 1.00]
- **Filipino Quiz Experience** — public_assets_fill_in_the_blanks_punan_ang_blangko_mode, public_assets_fill_in_the_blanks_tanong_question_card, public_assets_fill_in_the_blanks_answer_choices, public_assets_fill_in_the_blanks_filipino_language [INFERRED 0.85]
- **Answer and Advance Flow** — public_assets_true_false_quiz_question_card, public_assets_true_false_quiz_true_button, public_assets_true_false_quiz_false_button, public_assets_true_false_quiz_next_button [INFERRED 0.85]
- **Quiz HUD Status Group** — public_assets_true_false_quiz_progress_bar, public_assets_true_false_quiz_question_counter, public_assets_true_false_quiz_timer_score, public_assets_true_false_quiz_exit_button [INFERRED 0.85]
- **Institutional Identity Signifiers on the Student Subject** — public_assets_leader_student_subject, public_assets_leader_sti_college_uniform, public_assets_leader_sti_lanyard, public_assets_leader_school_crest [INFERRED 0.95]
- **Avatar-Ready Portrait Composition** — public_assets_leader_portrait, public_assets_leader_student_subject, public_assets_leader_plain_backdrop [INFERRED 0.85]
- **Fili-QuizMo Developer Profile Showcase** — public_assets_docu_documentation_developer_portrait, public_assets_docu_edrian_sarte, public_assets_web_dev_web_developer_portrait, public_assets_web_dev_john_carl_rubio, public_assets_web_dev_jpeg_team_carousel_photo [INFERRED 0.85]
- **School Topic Imagery Cluster** — public_assets_school_school_storefront_photo, public_assets_school_little_einstein_discovery_school, public_assets_school_deped_order_006_s_2026, public_assets_school_school_safety_reminders [INFERRED 0.85]
- **Fili-QuizMo Brand System** — public_assets_fili_quizmo_logo_fili_quizmo_logo, src_app_icon_app_icon, public_assets_fili_quizmo_logo_tarsier_face_mascot, public_assets_fili_quizmo_logo_pixel_art_aesthetic, public_assets_fili_quizmo_logo_warm_earth_tone_palette, public_assets_fili_quizmo_logo_oversized_eye_motif [INFERRED 0.85]
- **Little Einstein Discovery School Emblem System** — public_assets_logo_little_einstein_emblem, public_assets_logo_atom_symbol, public_assets_logo_shield_crest, public_assets_logo_ribbon_banner, public_assets_logo_blue_palette, public_assets_logo_little_einstein_discovery_school [INFERRED 0.85]
- **Next.js Starter Asset Icon Set** — public_file_file_icon, public_globe_globe_icon, public_next_next_js_logo, public_vercel_vercel_logo, public_window_window_icon [INFERRED 0.85]

## Communities (21 total, 3 thin omitted)

### Community 0 - "Auth Pages and Forms"
Cohesion: 0.11
Nodes (31): nextConfig, next, react, AdminLoginPage(), SignupPage(), TeacherLoginPage(), AdminLoginForm(), handleSubmit() (+23 more)

### Community 1 - "Build Config and Dependencies"
Cohesion: 0.07
Nodes (36): eslintConfig, allowScripts, unrs-resolver@1.12.2, dependencies, next@16.4.3, react@19.3.0, react-dom@19.3.0, @supabase/ssr@^0.12.7 (+28 more)

### Community 2 - "Static Landing Page"
Cohesion: 0.13
Nodes (22): Admin Dashboard Section, Admin Login Section, AI-Powered Filipino Quiz Generator, APK Download / Install Instructions, dbAdd() record insertion handler, Quiz Battles Hero Carousel, Fili-QuizMo Static Landing Page, Little Einstein Discovery School of Caloocan (+14 more)

### Community 3 - "Teacher Dashboard UI"
Cohesion: 0.16
Nodes (16): DashboardNavItem, DashboardShell(), DashboardShellProps, PieChart(), quizDistributions, navItems, quizzes, QuizzesSection() (+8 more)

### Community 4 - "Public Pages and Navigation"
Cohesion: 0.21
Nodes (13): AboutApp(), About(), carouselItems, developers, Home(), Footer(), Navbar(), navLinks (+5 more)

### Community 5 - "TypeScript Configuration"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "True-False Quiz Screen"
Cohesion: 0.23
Nodes (15): Albanya Dark Forest Question Text, Pixel City Skyline Backdrop, Exit Button, FALSE Answer Button, Filipino Language Localization, Instruction Text (Sagutin ng TRUE or FALSE lamang.), NEXT Button, Pixel-Art Retro Visual Style (+7 more)

### Community 7 - "Supabase Auth and Routing"
Cohesion: 0.26
Nodes (9): @supabase/ssr, AdminDashboardPage(), ProtectedAdminDashboard(), ProtectedTeacherDashboard(), TeacherDashboardPage(), getSupabaseConfig(), createClient(), config (+1 more)

### Community 8 - "Brand and Logo Assets"
Cohesion: 0.21
Nodes (14): Fili-QuizMo Logo (large primary mark), Mottled Fur-Like Backdrop Pattern, Oversized Eye Motif, Pixel Art / 8-Bit Aesthetic, Tarsier Face Mascot, Warm Earth-Tone Palette (Cream, Tan, Brown, Charcoal), Atom Symbol, Navy and Sky Blue Palette with Primary Accents (+6 more)

### Community 9 - "Fill-in-the-Blanks Quiz UI"
Cohesion: 0.26
Nodes (13): Answer Choice Buttons, Your Answer Text Input, Clear Button, Close Quiz Button, Countdown Timer, Filipino Language Localization, Fill in the Blanks Quiz Screen, Next Button (+5 more)

### Community 10 - "Home Screen and Menu"
Cohesion: 0.26
Nodes (13): ABOUT Button, Menu Action Panel, Philippine Eagle Mascot, Filipino-Language Interface Copy, Fili Quiz Mo Home Screen, JOIN Button, Night Sky Background with Stars and Clouds, Pixel Art Visual Style (+5 more)

### Community 11 - "Role Selection Screen"
Cohesion: 0.43
Nodes (8): City Skyline Background, FILI Quiz MO Title Logo, Owl Mascot Character, Pixel Art Visual Style, Role Selection Screen, Select Role Card, Student Role Button, Teacher Role Button

### Community 12 - "Developer Team Photos"
Cohesion: 0.40
Nodes (6): docu.jpg — Documentation Developer Portrait (selfie of a young man in glasses), Documentation Role Theme (filename-implied, not depicted), Edrian Sarte — Documentation Developer, John Carl Rubio — Web Developer, web-dev.jpeg — Team Carousel Photo (same cafe portrait, second copy), web-dev.jpg — Web Developer Portrait (man in sunglasses at a cafe table)

### Community 13 - "Leadership Portrait Asset"
Cohesion: 0.47
Nodes (6): Plain Light Gray Backdrop, leader.jpg Portrait Asset, STI College Embroidered Crest, STI College Uniform Polo, STI College Lanyard, Student Subject (Leadership Representative)

### Community 14 - "Root Layout and Fonts"
Cohesion: 0.33
Nodes (3): geistMono, geistSans, metadata

### Community 15 - "Default Avatar Asset"
Cohesion: 0.67
Nodes (4): Anonymous Avatar Placeholder, Default Profile Picture, Neutral Gray Circular Avatar Treatment, Person Silhouette Icon

### Community 16 - "School Topic Imagery"
Cohesion: 0.67
Nodes (4): DepEd Order No. 006, s. 2026 — Safe and Motivating Learning Environment, Little Einstein Discovery School, School Safety Reminders Signage (Bajik School, Baik Joy!), School.jpg — School Storefront Photo (Little Einstein Discovery School)

### Community 18 - "Starter Icon Assets"
Cohesion: 0.67
Nodes (3): File Icon, Globe Icon, Window Icon

## Ambiguous Edges - Review These
- `QUIT Button` → `Top-Right Settings Icon Button`  [AMBIGUOUS]
  public/assets/home_screen.jpg · relation: conceptually_related_to
- `docu.jpg — Documentation Developer Portrait (selfie of a young man in glasses)` → `Documentation Role Theme (filename-implied, not depicted)`  [AMBIGUOUS]
  public/assets/docu.jpg · relation: thematically_related_to
- `Fili-QuizMo Logo (large primary mark)` → `Little Einstein Discovery School Emblem`  [AMBIGUOUS]
  public/assets/logo.png · relation: provenance_unclear_in_project_assets

## Knowledge Gaps
- **26 isolated node(s):** `AGENTS.md Next.js Agent Rules`, `next/dist/server/lib/generate-agent-files.js`, `Trusted app_metadata.role authorization`, `public/assets README (title stub)`, `Little Einstein Discovery School of Caloocan` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 87 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Auth Pages and Forms` to `Build Config and Dependencies`, `Teacher Dashboard UI`, `Public Pages and Navigation`, `Supabase Auth and Routing`, `Root Layout and Fonts`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `AGENTS.md Next.js Agent Rules`, `next/dist/server/lib/generate-agent-files.js`, `Trusted app_metadata.role authorization` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Pages and Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.1101010101010101 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Auth Pages and Forms` to `Build Config and Dependencies`, `Teacher Dashboard UI`, `Public Pages and Navigation`, `Supabase Auth and Routing`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Should `Build Config and Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06827880512091039 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `QUIT Button` and `Top-Right Settings Icon Button`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `docu.jpg — Documentation Developer Portrait (selfie of a young man in glasses)` and `Documentation Role Theme (filename-implied, not depicted)`?**
  _Edge tagged AMBIGUOUS (relation: thematically_related_to) - confidence is low._