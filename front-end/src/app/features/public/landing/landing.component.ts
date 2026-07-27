// src/app/features/public/landing/landing.component.ts
import {
  Component, OnInit, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, ViewChildren, QueryList, HostListener
} from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

  // ─── ViewChildren para GSAP ──────────────────────────────────
  @ViewChild('heroSection')    heroSection!:    ElementRef;
  @ViewChild('heroTitle')      heroTitle!:      ElementRef;
  @ViewChild('heroSubtitle')   heroSubtitle!:   ElementRef;
  @ViewChild('benefitsBar')    benefitsBar!:    ElementRef;
  @ViewChild('benefit1')       benefit1!:       ElementRef;
  @ViewChild('benefit2')       benefit2!:       ElementRef;
  @ViewChild('benefit3')       benefit3!:       ElementRef;
  @ViewChild('featuredSection') featuredSection!: ElementRef;
  @ViewChild('categoriesSection') categoriesSection!: ElementRef;
  @ViewChild('footerSection')  footerSection!:  ElementRef;
  @ViewChild('coursesTrack')   coursesTrack!:   ElementRef;
  @ViewChild('userMenuRef')    userMenuRef!:    ElementRef;
  @ViewChildren('courseCard')  courseCards!:    QueryList<ElementRef>;
  @ViewChildren('categoryCard') categoryCards!: QueryList<ElementRef>;

  // ─── Estado ──────────────────────────────────────────────────
  currentUser: User | null = null;
  userMenuOpen = false;
  showLogin    = false;
  showRegister = false;
  selectedCourse: Course | null = null;
  enrollCourse:   Course | null = null;

  featuredCourses: Course[] = [];
  currentSlide = 0;
  currentCategory = 0;

  categories = [
    { name: 'Tecnologia da Informação', icon: 'bi-cpu',             description: 'Programação, redes, sistemas e desenvolvimento web.' },
    { name: 'Negócios e Empreendedorismo', icon: 'bi-graph-up-arrow', description: 'Gestão, marketing, finanças e liderança empresarial.' },
    { name: 'Artes e Design',           icon: 'bi-palette',          description: 'Design gráfico, fotografia, vídeo e criatividade.' }
  ];

  contactForm = { name: '', email: '', message: '' };

  private sub!: Subscription;
  private ctx!: gsap.Context;

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.loadFeaturedCourses();
  }

  ngAfterViewInit(): void {
    this.ctx = gsap.context(() => {
      this.animateHero();
      this.animateBenefits();
      this.animateFeatured();
      this.animateCategories();
      this.animateFooter();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.ctx?.revert();
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  // ─── Animações GSAP ──────────────────────────────────────────

  private animateHero(): void {
    const tl = gsap.timeline({ delay: 0.2 });
    tl.from(this.heroTitle.nativeElement, {
      y: 60, opacity: 0, duration: 0.9, ease: 'power3.out'
    })
    .from(this.heroSubtitle.nativeElement, {
      y: 40, opacity: 0, duration: 0.7, ease: 'power2.out'
    }, '-=0.4');
  }

  private animateBenefits(): void {
    ScrollTrigger.create({
      trigger: this.benefitsBar.nativeElement,
      start: 'top 85%',
      onEnter: () => {
        gsap.from(
          [this.benefit1.nativeElement, this.benefit2.nativeElement, this.benefit3.nativeElement],
          { y: 40, opacity: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.5)' }
        );
      }
    });
  }

  private animateFeatured(): void {
    ScrollTrigger.create({
      trigger: this.featuredSection.nativeElement,
      start: 'top 80%',
      onEnter: () => {
        const cards = this.courseCards.map(c => c.nativeElement);
        gsap.from(cards, {
          y: 50, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out'
        });
      }
    });
  }

  private animateCategories(): void {
    ScrollTrigger.create({
      trigger: this.categoriesSection.nativeElement,
      start: 'top 80%',
      onEnter: () => {
        const cards = this.categoryCards.map(c => c.nativeElement);
        gsap.from(cards, {
          scale: 0.85, opacity: 0, duration: 0.5, stagger: 0.12, ease: 'back.out(1.4)'
        });
      }
    });
  }

  private animateFooter(): void {
    ScrollTrigger.create({
      trigger: this.footerSection.nativeElement,
      start: 'top 90%',
      onEnter: () => {
        gsap.from(this.footerSection.nativeElement.children, {
          y: 30, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out'
        });
      }
    });
  }

  // ─── Dados ───────────────────────────────────────────────────

  loadFeaturedCourses(): void {
    this.courseService.getActive().subscribe({
      next: res => this.featuredCourses = res.data?.slice(0, 6) || [],
      error: () => this.featuredCourses = []
    });
  }

  getCourseImage(course: Course): string {
    return `http://localhost:3000/uploads/courses/${course.id}.jpg`;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/course-placeholder.jpg';
  }

  // ─── Navegação ───────────────────────────────────────────────

  prevSlide(): void {
    this.currentSlide = Math.max(0, this.currentSlide - 1);
    this.slideTrack();
  }

  nextSlide(): void {
    const max = Math.max(0, this.featuredCourses.length - 3);
    this.currentSlide = Math.min(max, this.currentSlide + 1);
    this.slideTrack();
  }

  private slideTrack(): void {
    const cardW = 320 + 24; // largura + gap
    gsap.to(this.coursesTrack.nativeElement, {
      x: -(this.currentSlide * cardW), duration: 0.4, ease: 'power2.out'
    });
  }

  prevCategory(): void { this.currentCategory = Math.max(0, this.currentCategory - 1); }
  nextCategory(): void { this.currentCategory = Math.min(this.categories.length - 1, this.currentCategory + 1); }

  filterByCategory(name: string): void {
    this.router.navigate(['/cursos'], { queryParams: { categoria: name } });
  }

  openCourseDetail(course: Course): void { this.selectedCourse = course; }
  openEnroll(course: Course): void {
    if (!this.currentUser) { this.openLogin(); return; }
    this.selectedCourse = null;
    this.enrollCourse = course;
  }

  // ─── Auth ────────────────────────────────────────────────────

  openLogin():    void { this.showLogin = true;  this.showRegister = false; }
  openRegister(): void { this.showRegister = true; this.showLogin = false; }
  closeModals():  void { this.showLogin = false; this.showRegister = false; }

  toggleUserMenu(): void { this.userMenuOpen = !this.userMenuOpen; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (this.userMenuRef && !this.userMenuRef.nativeElement.contains(e.target)) {
      this.userMenuOpen = false;
    }
  }

  goToDashboard(): void {
    this.userMenuOpen = false;
    this.authService.redirectByRole();
  }

  goTo(path: string): void {
    this.userMenuOpen = false;
    const role = this.authService.role;
    this.router.navigate([`/${role}/${path}`]);
  }

  logout(): void { this.authService.logout(); }

  submitContact(): void {
    // TODO: ligar ao backend
    alert('Mensagem enviada com sucesso!');
    this.contactForm = { name: '', email: '', message: '' };
  }
}