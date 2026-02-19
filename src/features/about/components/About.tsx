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
      <div className="bg-linear-to-br from-blog-lighter to-blog-light border-2 border-blog-border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 bg-linear-to-b from-blog-light to-blog-gradient-end rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
            <img
              src={profileImage}
              className="w-full h-full object-cover"
              alt="profileImage"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl text-gray-800 mb-2 font-bold">고범석</h2>
            <p className="text-sm text-gray-700 mb-4 font-semibold">
              Backend Developer
            </p>
            <div className="text-sm text-gray-700 leading-[1.8] mb-4 space-y-0.5">
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
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.id === "email" ? "_self" : "_blank"}
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-4 py-2 ${link.bgColor} ${link.hoverColor} text-white text-sm rounded-lg transition-all shadow-sm`}
                  >
                    <Icon className="w-4 h-4" />
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
        <div className="flex items-center gap-2 mb-5">
          <Code className="w-5 h-5 text-blog-primary" />
          <h3 className="text-lg text-gray-800 font-bold">Tech Stack</h3>
        </div>
        <div className="grid gap-4">
          {TECH_STACKS.map((stack) => (
            <div
              key={stack.category}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                  {stack.category}
                </h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {stack.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`px-3 py-1 text-xs md:text-sm font-medium rounded-md border transition-all duration-200 ${
                      skill.isPrimary
                        ? "bg-blog-primary border-blog-primary text-white shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-600"
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
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-blog-primary" />
          <h3 className="text-lg text-gray-800 font-bold">Experience</h3>
        </div>
        <div className="space-y-4">
          {EXPERIENCES.map((exp, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:border-blog-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-base text-gray-800 font-bold">
                      {exp.company}
                    </h4>
                    {exp.team && (
                      <>
                        <span className="text-gray-300 text-xs">|</span>
                        <span className="text-sm text-gray-500 font-medium">
                          {exp.team}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-blog-primary font-bold">
                    {exp.role}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md font-medium whitespace-nowrap">
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-2">
                {exp.descriptions.map((desc, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 leading-relaxed"
                  >
                    <span className="text-blog-primary mt-1.5 text-[6px]">
                      ●
                    </span>
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap className="w-5 h-5 text-blog-primary" />
          <h3 className="text-lg text-gray-800 font-bold">
            Education & Activities
          </h3>
        </div>
        <div className="space-y-3">
          {EDUCATIONS.map((edu, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blog-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-base text-gray-800 font-bold mb-2">
                    {edu.school}
                  </h4>
                  <p className="text-sm text-blog-primary font-semibold">
                    {edu.major}
                  </p>
                </div>
                <span className="text-[10px] md:text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-md font-medium whitespace-nowrap ml-2">
                  {edu.period}
                </span>
              </div>
              {edu.descriptions && (
                <ul className="mt-2 space-y-1">
                  {edu.descriptions.map((desc, i) => (
                    <li
                      key={i}
                      className="text-xs md:text-sm text-gray-600 flex items-start gap-1.5 leading-relaxed"
                    >
                      {desc}
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
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-blog-primary" />
          <h3 className="text-lg text-gray-800 font-bold">Awards</h3>
        </div>
        <div className="grid gap-3">
          {AWARDS.map((award, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blog-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <h4 className="text-base text-gray-800 font-bold">
                  {award.title}
                </h4>
                <span className="text-[10px] md:text-xs text-blog-primary font-bold uppercase">
                  {award.date}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{award.organization}</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                {award.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
