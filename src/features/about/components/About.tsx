import { Briefcase, GraduationCap, Code, Trophy } from "lucide-react";
import {
  SOCIAL_LINKS,
  TECH_STACKS,
  EXPERIENCES,
  EDUCATIONS,
  AWARDS,
} from "../constants";
import profileImage from "@/assets/beomseok.jpg";

export const About = () => {
  return (
    <div>
      {/* Profile */}
      <div className="bg-linear-to-br from-blog-lighter to-blog-light border-2 border-blog-border rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-linear-to-b from-blog-light to-blog-gradient-end rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            <img
              src={profileImage}
              className="w-full h-full object-cover"
              alt="profileImage"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl text-gray-800 mb-2 font-bold">
              고범석
            </h2>
            <p className="text-sm text-gray-700 mb-3 sm:mb-4 font-semibold">
              Backend Developer
            </p>
            <div className="text-xs sm:text-sm text-gray-700 leading-[1.8] mb-3 sm:mb-4 space-y-0.5">
              <p>
                안녕하세요! 함께 고민하고 성장하는 과정을 즐기는 백엔드
                개발자입니다.
              </p>
              <p>
                스스로 납득할 수 있는 코드를 작성하기 위해 고민하고 노력합니다.
              </p>
              <p>
                사람들과 함께 지내는 것을 좋아하고 장난치며 즐거운 분위기에서
                작업하고자 합니다.
              </p>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.id === "email" ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 ${link.bgColor} ${link.hoverColor} text-white text-xs sm:text-sm rounded-lg transition-all shadow-sm`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Code className="w-4 h-4 sm:w-5 sm:h-5 text-blog-primary" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Tech Stack
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {TECH_STACKS.map((stack) => (
            <div
              key={stack.category}
              className="bg-white border border-blog-border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <h4 className="text-xs sm:text-sm font-bold text-gray-700 mb-2 sm:mb-3">
                {stack.category}
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {stack.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs rounded-full border transition-all ${
                      skill.isPrimary
                        ? "bg-blog-primary border-blog-primary text-white"
                        : "bg-blog-lighter border-blog-border-lighter text-gray-600"
                    }`}
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-blog-primary" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Experience
          </h3>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {EXPERIENCES.map((exp, i) => (
            <div
              key={i}
              className="bg-white border border-blog-border rounded-lg p-3 sm:p-4 hover:border-blog-primary/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-bold text-gray-800">
                    {exp.company}
                  </h4>
                  {exp.team && (
                    <span className="text-gray-300 text-xs hidden sm:inline">
                      |
                    </span>
                  )}
                  {exp.team && (
                    <span className="text-xs sm:text-sm text-gray-500">
                      {exp.team}
                    </span>
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md mt-1 sm:mt-0 w-fit">
                  {exp.period}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blog-primary font-semibold mb-2">
                {exp.role}
              </p>
              <ul className="space-y-1.5">
                {exp.descriptions.map((desc, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-1.5 text-xs sm:text-sm text-gray-600 leading-relaxed"
                  >
                    <span className="text-blog-primary mt-1.5 text-[6px] shrink-0">
                      ●
                    </span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-blog-primary" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Education & Activities
          </h3>
        </div>
        <div className="space-y-3">
          {EDUCATIONS.map((edu, i) => (
            <div
              key={i}
              className="bg-white border border-blog-border rounded-lg p-3 sm:p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <h4 className="text-sm sm:text-base font-bold text-gray-800">
                  {edu.school}
                </h4>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {edu.period}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blog-primary font-semibold mb-2">
                {edu.major}
              </p>
              {edu.descriptions && (
                <ul className="space-y-1">
                  {edu.descriptions.map((desc, j) => (
                    <li
                      key={j}
                      className="text-[11px] sm:text-xs text-gray-500 flex items-start gap-1.5"
                    >
                      <span className="shrink-0">-</span> {desc}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Awards */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-5">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blog-primary" />
          <h3 className="text-base sm:text-lg font-bold text-gray-800">
            Awards
          </h3>
        </div>
        <div className="space-y-3">
          {AWARDS.map((award, i) => (
            <div
              key={i}
              className="bg-white border border-blog-border rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                <h4 className="text-sm sm:text-base font-bold text-gray-800">
                  {award.title}
                </h4>
                <span className="text-[10px] sm:text-xs text-blog-primary font-bold">
                  {award.date}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-gray-600 mb-1">
                {award.organization}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {award.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
